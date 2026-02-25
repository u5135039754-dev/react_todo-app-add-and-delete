/* eslint-disable jsx-a11y/label-has-associated-control */
import '../../styles/todo.scss';
import * as postService from '../../api/todos';
import { Filter, Todo as Todos } from '../../types/Todo';
import { useState } from 'react';
import React from 'react';
import classNames from 'classnames';
type Props = {
  posts: Todos[];
  todos: Todos;
  filter: Filter | undefined;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setPosts: React.Dispatch<React.SetStateAction<Todos[]>>;
};
export const TodoItem: React.FC<Props> = ({
  posts,
  filter,
  todos,
  setErrorMessage,
  setPosts,
}) => {
  const isTemp = useState<boolean | undefined>(undefined);
  const visibleTodos = posts.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }

    if (filter === 'completed') {
      return todo.completed;
    }

    return true;
  });

  const [updatingIds, setUpdatingIds] = useState<number[]>([]);

  async function handleTodoStatus(id: number, checked: boolean) {
    setErrorMessage('');
    setUpdatingIds(prev => [...prev, id]);
    try {
      const current = posts.find(post => post.id === id);

      if (!current) {
        return;
      }

      const serverTodo = await postService.updateTodo(id, {
        completed: checked,
      });

      setPosts(prev => prev.map(post => (post.id === id ? serverTodo : post)));
    } catch (error) {
      setErrorMessage('Unable to update todo');
    } finally {
      setUpdatingIds(prev => prev.filter(updatingId => updatingId !== id));
    }
  }

  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const onDelete = async (postId: number) => {
    setDeletingTodoId(postId);
    try {
      await postService.deletePost(postId);
      setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
    } catch (error) {
      setErrorMessage('Unable to delete todo');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setDeletingTodoId(null);
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todos.title);
  const [isUpdating, setIsUpdating] = useState(false);
  const handleEdit = async () => {
    const trimmed = editedTitle.trim();

    if (trimmed === '') {
      // Видалити todo
      await onDelete(todos.id);
      setIsEditing(false);

      return;
    }

    if (trimmed === todos.title) {
      setIsEditing(false);

      return;
    }

    setIsUpdating(true);
    try {
      const updated = await postService.updateTodo(todos.id, {
        title: trimmed,
      });

      setPosts(post =>
        post.map(todo => (todo.id === todos.id ? updated : todo)),
      );
    } catch {
      setErrorMessage('Unable to update a todo');
    } finally {
      setIsUpdating(false);
      setIsEditing(false);
    }
  };

  return (
    <div>
      {visibleTodos.map(post => (
        <div
          key={post.id}
          data-cy="Todo"
          className={classNames('todo', { completed: post.completed })}
        >
          <label className="todo__status-label" htmlFor="todoStatus">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              id="todoStatus"
              className="todo__status"
              onChange={event =>
                handleTodoStatus(post.id, event.target.checked)
              }
              checked={post.completed}
              disabled={updatingIds.includes(post.id)}
            />

            {isEditing && isUpdating ? (
              <input
                value={editedTitle}
                onChange={e => setEditedTitle(e.target.value)}
                onBlur={handleEdit}
                onKeyUp={e => {
                  if (e.key === 'Enter') {
                    handleEdit();
                  }

                  if (e.key === 'Escape') {
                    setIsEditing(false);
                  }
                }}
                autoFocus
              />
            ) : (
              <span onDoubleClick={() => setIsEditing(true)}>{post.title}</span>
            )}
          </label>
          <span data-cy="TodoTitle" className="todo__title">
            {post.title}
          </span>
          <button
            type="button"
            aria-label="Delete todo"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => onDelete(post.id)}
            disabled={deletingTodoId === post.id}
          >
            ×
          </button>
          {isTemp && (
            <div data-cy="TodoLoader" className="modal overlay">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
