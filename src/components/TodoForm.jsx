import { useState } from "react";
import { getTodos, setTodos, todoApi } from "../api/todos";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function TodoForm() {
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");

  const queryClient = useQuery({
    queryKey: ["todos"],
    queryFn: setTodos,
  });

  // TODO: useMutation 으로 리팩터링 하세요.
  const handleAddTodo = async (e) => {
    e.preventDefault();
    setTitle("");
    setContents("");
    const todoObj = {
      id: Date.now().toString(),
      title,
      contents,
      isCompleted: false,
      createdAt: Date.now(),
    };
    addTodoMutate(todoObj);
  };

  const { mutate: addTodoMutate } = useMutation({
    mutationFn: setTodos,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return (
    <form onSubmit={handleAddTodo}>
      <label htmlFor="title">제목:</label>
      <input
        type="text"
        id="title"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <label htmlFor="contents">내용:</label>
      <input
        id="contents"
        name="contents"
        value={contents}
        onChange={(e) => setContents(e.target.value)}
        required
      />
      <button type="submit">추가하기</button>
    </form>
  );
}
