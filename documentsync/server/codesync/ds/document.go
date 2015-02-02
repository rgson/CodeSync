package ds

import (
	"codesync/ds/checksum"
	"codesync/ds/queue"
	"fmt"
	"github.com/sergi/go-diff/diffmatchpatch"
	"io/ioutil"
)

const (
	DOCUMENT_PATH = "text.txt"
)

var dmp = diffmatchpatch.New()

type Document struct {
	Shadow *Shadow
	Backup *Backup
	Edits  queue.FIFO
}

type Shadow struct {
	Content       string
	LocalVersion  int
	RemoteVersion int
}

type Backup struct {
	Content      string
	LocalVersion int
}

func (d *Document) Initialize() {

	text := d.GetText()
	d.Shadow = &Shadow{Content: text, LocalVersion: 0, RemoteVersion: 0}
	d.Backup = &Backup{Content: text, LocalVersion: 0}

}

func (d *Document) GetText() string {
	inbyte, err := ioutil.ReadFile(DOCUMENT_PATH)
	if err != nil {
		return ""
	}
	return string(inbyte[:])
}

func (d *Document) SetText(content string) error {
	return ioutil.WriteFile(DOCUMENT_PATH, []byte(content), 0777)
}

func (d *Document) RestoreBackup() {

	d.Shadow.Content = d.Backup.Content
	d.Shadow.LocalVersion = d.Backup.LocalVersion

}

func (d *Document) TakeBackup() {

	d.Backup.Content = d.Shadow.Content
	d.Backup.LocalVersion = d.Shadow.LocalVersion

}

func (d *Document) HasEdits() bool {

	return !d.Edits.IsEmpty()

}

func (d *Document) GetEdits() (version int, edits []Edit) {

	version = d.Shadow.RemoteVersion
	edits = make([]Edit, d.Edits.Count())
	for i, edit := range d.Edits.ToArray() {
		edits[i] = edit.(Edit)
	}
	return

}

func (d *Document) CalculateEdit() {

	text := d.GetText()

	// Calculate differences.
	diffs := dmp.DiffMain(d.Shadow.Content, text, false)
	diffs = dmp.DiffCleanupEfficiency(diffs)

	// Calculate patch.
	patches := dmp.PatchMake(d.Shadow.Content, diffs)
	if len(patches) < 1 {
		// No differences.
		return
	}
	patchesText := dmp.PatchToText(patches)

	// Increment shadow.
	d.Shadow.Content = text
	d.Shadow.LocalVersion++

	// Add edit to edit queue.
	edit := Edit{Version: d.Shadow.LocalVersion, Patch: patchesText, MD5: checksum.MD5(d.Shadow.Content)}
	d.Edits.Enqueue(edit)

}

func (d *Document) ApplyEdits(version int, edits []Edit) error {

	if version < d.Shadow.LocalVersion && version == d.Backup.LocalVersion {
		// Edits are based on an old version. Use the backup shadow.
		d.RestoreBackup()

	} else if version < d.Shadow.LocalVersion && version != d.Backup.LocalVersion {
		// Edits are based on an old version, but somehow the backup is out of sync. Reinitialize and accept loss.
		return fmt.Errorf("patch failed: version mismatch (backup out of sync: client remote %d, backup local %d)", version, d.Backup.LocalVersion)

	} else if version > d.Shadow.LocalVersion {
		// Somehow, the client received a version we never had. Reinitialize and accept loss.
		return fmt.Errorf("patch failed: version mismatch (client ahead of source: client remote %d, server local %d)", version, d.Shadow.LocalVersion)

	}

	// Versions match - apply patch
	for _, edit := range edits {

		if edit.Version <= d.Shadow.RemoteVersion {
			// Already handled
			continue

		} else if edit.Version > d.Shadow.RemoteVersion+1 {
			// Somehow we've skipped one version. Reinitialize and accept loss.
			return fmt.Errorf("patch failed: version mismatch (missing version)")

		}

		// Versions match - apply patch
		patch, _ := dmp.PatchFromText(edit.Patch)

		// Apply to shadow (strict)
		newShadow := *d.Shadow
		newShadow.Content, _ = dmp.PatchApply(patch, d.Shadow.Content)
		newShadow.RemoteVersion = edit.Version

		if checksum.MD5(newShadow.Content) != edit.MD5 {
			// Strict patch unsuccessful. Reinitialize and accept loss.
			return fmt.Errorf("patch failed: strict patch unsuccessful")
		}

		// Strict patch successful.
		d.Shadow = &newShadow

		// Copy shadow to backup.
		d.TakeBackup()

		// Apply to text (fuzzy).
		newText, _ := dmp.PatchApply(patch, d.GetText())
		d.SetText(newText)

	}

	return nil

}

func (d *Document) RemoveConfirmedEdits(version int) {

	//Remove confirmed edits from the queue.
	for {
		edit := d.Edits.Peek()
		if edit == nil {
			break
		}
		if edit.(Edit).Version > version {
			break
		}
		d.Edits.Dequeue()
	}

	// Take backup
	d.TakeBackup()

}
