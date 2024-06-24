import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { todoApi } from "../api/todos";

export default function TodoList() {
  const navigate = useNavigate();
  const {
    data: todos,
    error,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const response = await todoApi.get("/todos");
      return response.data;
    },
  });

  const queryClient = useQueryClient();

  const { mutate: updateTodos } = useMutation({
    mutationFn: async (targetTodo) => {
      const previousTodos = [...todos];
      try {
        queryClient.setQueryData(["todos"], (prev) =>
          prev.map((todo) =>
            todo.id === targetTodo.id ? { ...todo, liked: !todo.liked } : todo
          )
        );
        await todoApi.patch(`/todos/${targetTodo.id}`, {
          liked: !targetTodo.liked,
        });
      } catch (err) {
        console.error(err);
        queryClient.setQueryData(["todos"], previousTodos);
      } finally {
        refetch();
      }
    },
    // When mutate is called:
    onMutate: async (newTodo) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(["todos"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["todos"], (old) => {
        const restTodos = old.filter((todo) => {
          return todo.id !== newTodo.id;
        });

        return [...restTodos, { ...newTodo, liked: !newTodo.liked }];
      });

      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["todos"], context.previousTodos);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // TODO: 아래 handleLike 로 구현되어 있는 부분을 useMutation 으로 리팩터링 해보세요. 모든 기능은 동일하게 동작해야 합니다.

  if (isPending) {
    return <div style={{ fontSize: 36 }}>로딩중...</div>;
  }

  if (error) {
    console.error(error);
    return (
      <div style={{ fontSize: 24 }}>에러가 발생했습니다: {error.message}</div>
    );
  }

  return (
    <ul style={{ listStyle: "none", width: 250 }}>
      {todos.map((todo) => (
        <li
          key={todo.id}
          style={{
            border: "1px solid black",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <h3>{todo.title}</h3>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => navigate(`/detail/${todo.id}`)}>
              내용보기
            </button>
            {todo.liked ? (
              <FaHeart
                onClick={() => updateTodos(todo)}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <FaRegHeart
                onClick={() => updateTodos(todo)}
                style={{ cursor: "pointer" }}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
