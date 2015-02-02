package ds

import (
	"code.google.com/p/go.net/websocket"
	"fmt"
	"time"
)

const (
	EDITS_INTERVAL = 500 * time.Millisecond
	SEND_INTERVAL  = 500 * time.Millisecond
)

type Client struct {
	ID          int
	Connection  *websocket.Conn
	Document    *Document
	Initialized bool
}

func (c *Client) Handle() {
	defer c.Connection.Close()

	// Run a timed goroutine to calculate edits.
	editTicker := time.NewTicker(EDITS_INTERVAL)
	go func() {
		for _ = range editTicker.C {
			if c.Initialized {
				c.Document.CalculateEdit()
			}
		}
	}()
	defer editTicker.Stop()

	// Run a timed goroutine to send available edits.
	sendTicker := time.NewTicker(SEND_INTERVAL)
	go func() {
		for _ = range sendTicker.C {
			if c.Initialized {
				if c.Document.HasEdits() {
					c.sendEdits()
				}
			}
		}
	}()
	defer sendTicker.Stop()

	// Listen for messages.
	for {
		buffer := make([]byte, 1024)
		length, err := c.Connection.Read(buffer)

		if err != nil {
			break
		}

		msg, msgtype := ParseMessage(buffer[:length])
		c.handleMessage(msg, msgtype)
	}

}

func (c *Client) initialize() {

	c.Initialized = false
	c.Document = &Document{}
	c.Document.Initialize()
	c.sendDocument()
	c.Initialized = true

}

func (c *Client) handleMessage(msg interface{}, msgtype string) {

	switch msgtype {

	case MSGTYPE_EDIT:
		c.handleEditMessage(msg.(EditMessage))

	case MSGTYPE_ACK:
		c.handleAckMessage(msg.(AckMessage))

	case MSGTYPE_REQUEST:
		c.handleRequestMessage(msg.(RequestMessage))

	}

}

func (c *Client) handleEditMessage(msg EditMessage) {

	err := c.Document.ApplyEdits(msg.Version, msg.Edits)
	if err != nil {
		// Patch unsuccessful - reinitialize and accept loss.
		fmt.Printf("Client %d: %s\n", c.ID, err.Error())
		c.initialize()
	} else {
		// Patch successful - send ack.
		c.sendAck()
	}

}

func (c *Client) handleAckMessage(msg AckMessage) {
	c.Document.RemoveConfirmedEdits(msg.Version)
}

func (c *Client) handleRequestMessage(msg RequestMessage) {
	c.initialize()
}

func (c *Client) sendEdits() {
	msg := NewEditMessage(c.Document.GetEdits())
	c.Connection.Write(msg.ToJSON())
}

func (c *Client) sendAck() {
	msg := NewAckMessage(c.Document.Shadow.RemoteVersion)
	c.Connection.Write(msg.ToJSON())
}

func (c *Client) sendDocument() {
	msg := NewDocumentMessage(c.Document.Shadow.Content)
	c.Connection.Write(msg.ToJSON())
}
