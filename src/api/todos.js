import axios from "axios";

export const todoApi = axios.create({
  baseURL: "http://localhost:4000",
});

const getTodos = async () => {
  const { data } = await todoApi.get("/todos");
  return data;
};

const setTodos = async (querykey) => {
  console.log(querykey);
  const { data } = await todoApi.post("/todos", obj);
  return data;
};

export { getTodos, setTodos };
