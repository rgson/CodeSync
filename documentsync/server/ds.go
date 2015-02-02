package main

import (
	"code.google.com/p/go.net/websocket"
	"codesync/ds"
	"codesync/lb"
	"flag"
	"fmt"
	"net"
	"net/http"
	"os"
	"strconv"
	"time"
)

const (
	CONN_HOST       = "localhost"     // Default listening network.
	CONN_PORT       = 4343            // Default listening port.
	HEARTBEAT_HOST  = "localhost"     // Default target host for heartbeat monitor.
	HEARTBEAT_PORT  = 3434            // Default target port for heartbeat monitor.
	HEARTBEAT_TIMER = 8 * time.Second // Heartbeat interval.
)

var host string
var port int
var cardiacarrest bool

var clients int = 0
var nextId int = 0

func main() {

	// Read flags
	flag.StringVar(&host, "h", CONN_HOST, "The server's listening network address.")
	flag.IntVar(&port, "p", CONN_PORT, "The server's listening port.")
	flag.BoolVar(&cardiacarrest, "cardiacarrest", false, "Flag for disabling heartbeat signals.")
	flag.Parse()

	fmt.Println("Starting document server...")

	if !cardiacarrest {
		go heartbeat()
		fmt.Println("Heartbeat running!")
	}

	connectionHandler()

	fmt.Println("Stopped")

}

func heartbeat() {

	for {
		sendHeartbeat()
		time.Sleep(HEARTBEAT_TIMER)
	}

}

func sendHeartbeat() {

	conn, err := net.Dial("tcp", heartbeatAddr())
	if err != nil {
		fmt.Println("Error dialing:", err.Error())
		return
	}
	defer conn.Close()

	msg := lb.Message{Address: addr(), Load: clients}
	_, err = conn.Write(msg.ToJSON())
	if err != nil {
		fmt.Println("Heartbeat failed:", err.Error())
	} else {
		fmt.Println("Sent heartbeat")
	}

}

func connectionHandler() {
	http.Handle("/", websocket.Handler(serveClient))
	err := http.ListenAndServe(addr(), nil)
	if err != nil {
		fmt.Println("Error listening:", err.Error())
		os.Exit(1)
	}
}

func serveClient(ws *websocket.Conn) {
	id := addClient()
	client := ds.Client{ID: id, Connection: ws}
	client.Handle()
	dropClient()
}

func addClient() int {
	clients++
	nextId++
	id := nextId
	fmt.Printf("Client connected. %d clients connected.\n", clients)
	return id
}

func dropClient() {
	clients--
	fmt.Printf("Client disconnected. %d clients connected.\n", clients)
}

func addr() string {

	return host + ":" + strconv.Itoa(port)

}

func heartbeatAddr() string {

	return HEARTBEAT_HOST + ":" + strconv.Itoa(HEARTBEAT_PORT)

}
