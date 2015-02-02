package queue

type FIFO struct {
	Head *Element
}

type Element struct {
	Value interface{}
	Next  *Element
}

func (q *FIFO) Enqueue(e interface{}) {

	element := &Element{Value: e}

	if q.Head != nil {
		element.Next = q.Head.Next
		q.Head.Next = element
	} else {
		element.Next = element
	}

	q.Head = element

}

func (q *FIFO) Dequeue() (value interface{}) {

	if q.Head != nil {
		value = q.Head.Next.Value

		if q.Head.Next == q.Head {
			q.Head = nil
		} else {
			q.Head.Next = q.Head.Next.Next
		}
	}

	return

}

func (q *FIFO) Peek() (value interface{}) {

	if q.Head != nil {
		value = q.Head.Next.Value
	}

	return
}

func (q *FIFO) Count() (count int) {

	if q.Head == nil {
		return 0
	}

	element := q.Head.Next
	count = 1
	for element != q.Head {
		element = element.Next
		count++
	}
	return
}

func (q *FIFO) IsEmpty() bool {

	return q.Head == nil

}

func (q *FIFO) ToArray() (elements []interface{}) {

	count := q.Count()
	elements = make([]interface{}, count)

	element := q.Head
	for i := 0; i < count; i++ {
		element = element.Next
		elements[i] = element.Value
	}

	return
}
