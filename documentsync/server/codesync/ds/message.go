package ds

import (
	"encoding/json"
)

const (
	MSGTYPE_EDIT     = "edit"
	MSGTYPE_ACK      = "ack"
	MSGTYPE_DOCUMENT = "doc"
	MSGTYPE_REQUEST  = "req"
)

type Message struct {
	MessageType string `json:"type"`
}

type DocumentMessage struct {
	MessageType string `json:"type"`
	Version     int    `json:"v"`
	Content     string `json:"content"`
}

type RequestMessage struct {
	MessageType string `json:"type"`
}

type AckMessage struct {
	MessageType string `json:"type"`
	Version     int    `json:"v"`
}

type EditMessage struct {
	MessageType string `json:"type"`
	Version     int    `json:"v"`
	Edits       []Edit `json:"edits"`
}

type Edit struct {
	Version int    `json:"v"`
	Patch   string `json:"patch"`
	MD5     string `json:"md5"`
}

func ParseMessage(msg []byte) (message interface{}, msgtype string) {

	basicMsg := Message{}
	json.Unmarshal(msg, &basicMsg)

	msgtype = basicMsg.MessageType

	switch msgtype {

	case MSGTYPE_EDIT:
		realMsg := EditMessage{}
		json.Unmarshal(msg, &realMsg)
		message = realMsg

	case MSGTYPE_ACK:
		realMsg := AckMessage{}
		json.Unmarshal(msg, &realMsg)
		message = realMsg

	case MSGTYPE_DOCUMENT:
		realMsg := DocumentMessage{}
		json.Unmarshal(msg, &realMsg)
		message = realMsg

	case MSGTYPE_REQUEST:
		realMsg := RequestMessage{}
		json.Unmarshal(msg, &realMsg)
		message = realMsg

	}

	return

}

func (m EditMessage) ToJSON() []byte {
	msg, _ := json.Marshal(m)
	return msg
}

func (m AckMessage) ToJSON() []byte {
	msg, _ := json.Marshal(m)
	return msg
}

func (m DocumentMessage) ToJSON() []byte {
	msg, _ := json.Marshal(m)
	return msg
}

func NewEditMessage(version int, edits []Edit) EditMessage {

	return EditMessage{MessageType: MSGTYPE_EDIT, Version: version, Edits: edits}

}

func NewAckMessage(version int) AckMessage {

	return AckMessage{MessageType: MSGTYPE_ACK, Version: version}

}

func NewDocumentMessage(content string) DocumentMessage {

	return DocumentMessage{MessageType: MSGTYPE_DOCUMENT, Content: content}

}
