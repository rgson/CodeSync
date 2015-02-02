package bully

import (
	"encoding/json"
	"fmt"
	"net"
	"os"
	"time"
)

const (
	CONFIG_FILE   = "processes.json"
	TIMEOUT       = 5 * time.Second
	PING_INTERVAL = 10 * time.Second
	MSG_PING      = "ping"
	MSG_VOTE      = "vote"
	MSG_ALIVE     = "alive"
	MSG_LEADER    = "leader"
)

var id int
var processes = make(map[int]string)
var leader int
var output chan bool

func Start(pid int, leaderChannel chan bool) {

	id = pid
	output = leaderChannel

	// Read processes from config
	err := readConfig()
	if err != nil {
		panic(err.Error())
	}

	if _, exists := processes[id]; !exists {
		panic("Could not find the provided ID in the config file.")
	}

	// Listen for other processes
	listenAddr := processes[id]
	delete(processes, id)
	go listen(listenAddr)

	// Guess leader (highest ID)
	guessLeader()

	// Ping leader at interval
	for {
		if leader != id {
			alive := pingLeader()
			if !alive {
				fmt.Printf("%d: No response from leader!\n", id)
				announceVote()
			}
		}
		time.Sleep(PING_INTERVAL)
	}

}

func readConfig() error {

	file, err := os.Open(CONFIG_FILE)
	if err != nil {
		return fmt.Errorf("Failed to open configuration file: %s", CONFIG_FILE)
	}
	defer file.Close()

	decoder := json.NewDecoder(file)
	procs := &Processes{}
	decoder.Decode(&procs)

	for _, proc := range procs.Processes {
		processes[proc.ID] = fmt.Sprintf("%s:%d", proc.Host, proc.Port)
	}

	return nil

}

func listen(addr string) {

	l, err := net.Listen("tcp", addr)
	if err != nil {
		panic(fmt.Sprintf("Error listening: %s", err.Error()))
	}
	defer l.Close()

	for {
		// Listen for an incoming connection.
		conn, err := l.Accept()
		if err != nil {
			fmt.Println("Error accepting: ", err.Error())
		}
		// Handle connections in a new goroutine.
		go handleConn(conn)
	}

}

func handleConn(conn net.Conn) {
	defer conn.Close()

	// Read from connection
	buf := make([]byte, 512)
	conn.SetReadDeadline(time.Now().Add(TIMEOUT))
	n, err := conn.Read(buf)
	if err != nil {
		return
	}

	// Unmarshal message
	msg := Message{}
	err = json.Unmarshal(buf[:n], &msg)

	// Handle message
	switch msg.Type {
	case MSG_VOTE:
		fmt.Printf("%d: Got vote message.\n", id)
		go announceVote()
		fallthrough
	case MSG_PING:
		fmt.Printf("%d: Sending 'alive' message.\n", id)
		response := Message{Type: MSG_ALIVE, Sender: id}
		conn.Write(response.ToJSON())
	case MSG_LEADER:
		if msg.Sender > id {
			setLeader(msg.Sender)
		} else {
			fmt.Printf("%d: Leader with lower ID. Bullying!\n", id)
			go announceVote()
		}
	}

}

func setLeader(lead int) {

	wasLeader := (leader == id)

	leader = lead

	isLeader := (leader == id)

	if wasLeader != isLeader {
		output <- isLeader
		fmt.Printf("%d: New leader %d.\n", id, leader)
	}

}

func guessLeader() {

	lead := id
	for k, _ := range processes {
		if lead < k {
			lead = k
		}
	}
	setLeader(lead)

	if leader == id {
		announceVictory()
	}

}

func announceVictory() {

	fmt.Printf("%d: I'm the new leader!\n", id)

	setLeader(id)
	for pid, _ := range processes {
		msg := Message{Type: MSG_LEADER, Sender: id}
		send(pid, msg)
	}

}

func announceVote() {

	fmt.Printf("%d: The leader is down!\n", id)

	c := make(chan bool)

	for pid, _ := range processes {
		if id < pid {
			go ask(pid, c)
		}
	}

	select {
	case <-c:
		return
	case <-time.After(TIMEOUT):
		fmt.Printf("%d: No anwser from higher processes.\n", id)
		announceVictory()
	}

}

func pingLeader() bool {

	// Dial leader
	conn, err := dial(leader)
	if err != nil {
		return false
	}
	defer conn.Close()

	// Send ping
	msg := Message{Type: MSG_PING, Sender: id}
	_, err = conn.Write(msg.ToJSON())
	if err != nil {
		return false
	}

	// Wait for answer
	buf := make([]byte, 512)
	conn.SetReadDeadline(time.Now().Add(TIMEOUT))
	_, err = conn.Read(buf)
	if err != nil {
		return false
	}

	return true

}

func dial(pid int) (conn net.Conn, err error) {

	conn, err = net.Dial("tcp", processes[pid])
	if err != nil {
		err = fmt.Errorf("Error dialing process %d", pid)
		fmt.Printf("%d: %s\n", id, err.Error())
	}

	return

}

func send(pid int, msg Message) error {

	conn, err := dial(pid)
	if err == nil {
		_, err = conn.Write(msg.ToJSON())
	}

	return err

}

func ask(pid int, c chan bool) {

	msg := Message{Type: MSG_VOTE, Sender: id}

	// Dial process
	conn, err := dial(pid)
	if err != nil {
		return
	}
	defer conn.Close()

	// Send vote announcement
	_, err = conn.Write(msg.ToJSON())
	if err != nil {
		return
	}

	// Wait for answer
	buf := make([]byte, 512)
	conn.SetReadDeadline(time.Now().Add(TIMEOUT))
	_, err = conn.Read(buf)
	if err != nil {
		return
	}

	fmt.Printf("%d: Answer from %d.\n", id, pid)
	c <- true

}

type Processes struct {
	Processes []Process `json:"processes"`
}

type Process struct {
	ID   int    `json:"id"`
	Host string `json:"host"`
	Port int    `json:"port"`
}

type Message struct {
	Type   string `json:"type"`
	Sender int    `json:"sender"`
}

func (m Message) ToJSON() []byte {
	msg, _ := json.Marshal(m)
	return msg
}
