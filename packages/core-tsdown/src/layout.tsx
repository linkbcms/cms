import { m } from '@/paraglide/messages';
import { getLocale, setLocale } from '@/paraglide/runtime';
import type React from 'react';
import { Link } from 'wouter';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-blue-900 p-5">
      <div>Layout</div>

      <div className="flex flex-wrap gap-2 bg-red-500">
        {m.example_message({ username: 'John Doe' })}

        <Link to="/" className={'underline'}>
          Home
        </Link>
        <Link to="/collections" className={'underline'}>
          Collections
        </Link>
        <Link to="/collections/posts" className={'underline'}>
          Posts
        </Link>
        <Link to="/collections/posts/add/new" className={'underline'}>
          Add New Post
        </Link>
        <Link to="/collections/posts/1" className={'underline'}>
          Post 1
        </Link>

        <div className="flex gap-2">
          Current Locale: {getLocale()}
          <button type="button" onClick={() => setLocale('id')}>
            Go to ID
          </button>
          <button type="button" onClick={() => setLocale('en')}>
            Go to EN
          </button>
        </div>
      </div>

      {children}
    </div>
  );
};
