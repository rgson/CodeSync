package main

import (
	"codesync/lb"
	"codesync/lb/bully"
	"encoding/json"
	"flag"
	"fmt"
	"net"
	"os"
	"strconv"
	"time"
)

const (
	CONN_HOST      = "localhost"       // Listening network.
	CONN_PORT      = 3434              // Listening port.
	DS_TIMEOUT     = 10 * time.Second  // Timeout period for a document server's heartbeat signal.
	LISTEN_TIMEOUT = 1 * time.Second   // Timeout period for connection listening.
	CONN_TIMEOUT   = 10 * time.Second  // Timout period for an established connection to send a message.
	DNS_TIMER      = 300 * time.Second // Interval för DNS updates.
)

var id int
var leader bool
var dsLoad = make(map[string]int)
var dsTimer = make(map[string]chan bool)

func main() {
	defer func() {
		if r := recover(); r != nil {
			fmt.Println(r)
			os.Exit(1)
		}
	}()

	// Read ID from flag
	flag.IntVar(&id, "id", -1, "The process' ID")
	flag.Parse()

	if id == -1 {
		fmt.Println("A process ID must be provided with the '-id' flag.")
		os.Exit(1)
	}

	c := make(chan bool)
	go listen(c)
	bully.Start(id, c)
}

func listen(c chan bool) {

	stopper := make(chan bool)

	for {

		if <-c {

			fmt.Println("Got leader signal")

			time.Sleep(1 * time.Second)
			go startListening(stopper)

		} else {

			fmt.Println("Got not leader signal")

			stopper <- false
		}

	}

}

func startListening(stopper chan bool) {

	// Listen for incoming connections.
	addr, _ := net.ResolveTCPAddr("tcp", listenAddr())
	l, err := net.ListenTCP("tcp", addr)
	if err != nil {
		fmt.Println("Error listening:", err.Error())
		return
	}
	defer l.Close()

	// Run a timed goroutine to select the best server.
	dnsTicker := time.NewTicker(DNS_TIMER)
	go func() {
		for _ = range dnsTicker.C {
			selectServer()
		}
	}()
	defer dnsTicker.Stop()

	// Actively listen for connections.
	fmt.Println("Listening on " + listenAddr())
	for {
		select {
		case <-stopper:
			fmt.Println("Stopped listening")
			return
		default:
			l.SetDeadline(time.Now().Add(LISTEN_TIMEOUT))
			conn, err := l.Accept()
			if err == nil {
				// Handle connections in a new goroutine.
				go handleRequest(conn)
			}
		}
	}

}

// Handles incoming requests.
func handleRequest(conn net.Conn) {
	defer conn.Close()

	// Read from connection
	buf := make([]byte, 512)
	conn.SetReadDeadline(time.Now().Add(CONN_TIMEOUT))
	n, err := conn.Read(buf)
	if err != nil {
		return
	}

	// Unmarshal message
	msg := lb.Message{}
	err = json.Unmarshal(buf[:n], &msg)

	// Handle message
	updateDS(msg.Address, msg.Load)

}

func updateDS(addr string, load int) {

	dsLoad[addr] = load

	if _, exists := dsTimer[addr]; !exists {
		dsTimer[addr] = make(chan bool)
		go trackDS(addr)
	}

	dsTimer[addr] <- true

	fmt.Printf("Headerbeat:\t%s\t%d\n", addr, load)

}

func trackDS(addr string) {

	for {
		select {
		case <-dsTimer[addr]:
		case <-time.After(DS_TIMEOUT):
			delete(dsLoad, addr)
			delete(dsTimer, addr)
			return
		}
	}

}

func selectServer() {
	var min string = ""

	// Find server with least connections.
	for ip, clients := range dsLoad {
		if min == "" {
			min = ip
			continue
		}

		if dsLoad[min] > clients {
			min = ip
		}
	}

	// Make sure a server was found (i.e. at least one server exists).
	if min != "" {
		// Change the active server.
		changeDNS(min)
	}
}

func changeDNS(ip string) {
	//TODO get domain, update dns.
	fmt.Printf("DNS: Active server is %s with %d clients.\n", ip, dsLoad[ip])
}

func printServers() {
	fmt.Printf("LST: ------\n")
	for ip, clients := range dsLoad {
		fmt.Printf("LST: %s\t%d\n", ip, clients)
	}
	fmt.Printf("LST: ------\n")
}

func listenAddr() string {

	return CONN_HOST + ":" + strconv.Itoa(CONN_PORT)

}
