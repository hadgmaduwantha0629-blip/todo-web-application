import api from "@/lib/axios";

export const getTodos = async (token) => {

    const response = await api.get("/todos", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
}

export const createTodo = async (token, todo) => {

    const response = await api.post(
        "/todos",
        todo,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const deleteTodo = async (token, id) => {

    const response = await api.delete(`/todos/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

export const updateTodo = async (token, id, todo) => {

    const response = await api.put(
        `/todos/${id}`,
        todo,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};