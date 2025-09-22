import type React from 'react';
import { Link } from 'wouter';
import { m } from '@/paraglide/messages';
import { getLocale, setLocale } from '@/paraglide/runtime';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-blue-900 p-5">
      <div>Layout</div>

      <div className="flex flex-wrap gap-2 bg-red-500">
        {m.example_message({ username: 'John Doe' })}

        <Link className={'underline'} to="/">
          Home
        </Link>
        <Link className={'underline'} to="/collections">
          Collections
        </Link>
        <Link className={'underline'} to="/collections/posts">
          Posts
        </Link>
        <Link className={'underline'} to="/collections/posts/add/new">
          Add New Post
        </Link>
        <Link className={'underline'} to="/collections/posts/1">
          Post 1
        </Link>

        <div className="flex gap-2">
          Current Locale: {getLocale()}
          <button onClick={() => setLocale('id')} type="button">
            Go to ID
          </button>
          <button onClick={() => setLocale('en')} type="button">
            Go to EN
          </button>
        </div>
      </div>

      {children}
    </div>
  );
};
