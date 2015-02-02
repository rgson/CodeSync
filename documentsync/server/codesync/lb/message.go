package lb

import (
	"encoding/json"
	"fmt"
)

type Message struct {
	Address string `json:"addr"`
	Load    int    `json:"load"`
}

func (m Message) ToJSON() []byte {
	msg, _ := json.Marshal(m)
	return msg
}

func MessageFromJSON(buf []byte) (Message, error) {
	msg := Message{}
	err := json.Unmarshal(buf, &msg)
	return msg, err
}

func NewMessage(host, port string, load int) Message {
	return Message{Address: fmt.Sprintf("%s:%d", host, port), Load: load}
}
