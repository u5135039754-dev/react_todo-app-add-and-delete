import '../../styles/todoapp.scss';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import * as postService from '../../api/todos';
import { USER_ID } from '../../api/todos';
import { Todo } from '../../types/Todo';
import React from 'react';

type Props = {
  posts: Todo[];
  setPosts: Dispatch<SetStateAction<Todo[]>>;
  loading: boolean;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setTempTodo: React.Dispatch<React.SetStateAction<Todo | null>>;
};

export const TodoApp: React.FC<Props> = ({
  posts,
  setPosts,
  loading,
  setErrorMessage,
  setTempTodo,
}) => {
  const [title, setTitle] = useState('');
  const isTitleEmpty = title.trim() === '';
  const allCompleted = posts.length > 0 && posts.every(post => post.completed);
  const hasPosts = posts.length > 0;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isAdding, setIsAdding] = useState(false);

  async function handleAddPost(event: React.FormEvent) {
    event.preventDefault();
    const value = title.trim();

    if (!value) {
      setErrorMessage('Title should not be empty');

      return;
    }

    setErrorMessage('');
    setIsAdding(true);
    setTempTodo({
      id: 0,
      title: value,
      completed: false,
      userId: USER_ID,
    });
    try {
      const newTodo = await postService.createTodo(value, USER_ID);

      setPosts(current => [...current, newTodo]);
      setTitle('');
    } catch {
      setErrorMessage('Unable to add a todo');
    } finally {
      setIsAdding(false);
      setTempTodo(null);
    }
  }

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  return (
    <header className="todoapp__header">
      {hasPosts ? (
        allCompleted ? (
          <button
            type="button"
            disabled={isTitleEmpty || loading}
            onClick={handleAddPost}
            className="todoapp__toggle-all"
            data-cy="ToggleAllButton"
          />
        ) : (
          <button
            type="button"
            disabled={isTitleEmpty || loading}
            onClick={handleAddPost}
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />
        )
      ) : null}

      <form onSubmit={handleAddPost}>
        <input
          data-cy="NewTodoField"
          type="text"
          ref={inputRef}
          value={title}
          onChange={event => setTitle(event.target.value)}
          disabled={isAdding || loading}
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
        />
      </form>
    </header>
  );
};
