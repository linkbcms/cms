import { m } from './paraglide/messages';
import { getLocale, locales, setLocale } from './paraglide/runtime';
import type { JSX } from 'react/jsx-runtime';

export const App = (): JSX.Element => {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Stats Overview */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="flex aspect-video flex-col justify-between rounded-xl bg-muted/50 p-4">
            <h3 className="font-semibold text-lg">Total Pages</h3>
            <div className="font-bold text-2xl">24</div>
          </div>
          <div className="flex aspect-video flex-col justify-between rounded-xl bg-muted/50 p-4">
            <h3 className="font-semibold text-lg">Published Posts</h3>
            <div className="font-bold text-2xl">156</div>
          </div>
          <div className="flex aspect-video flex-col justify-between rounded-xl bg-muted/50 p-4">
            <h3 className="font-semibold text-lg">Active Users</h3>
            <div className="font-bold text-2xl">12</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex-1 rounded-xl bg-muted/50 p-6">
          <h2 className="mb-5 font-semibold text-2xl">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Homepage Updated</p>
                <p className="text-muted-foreground text-sm">by John Doe</p>
              </div>
              <span className="text-muted-foreground text-sm">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Blog Post Published</p>
                <p className="text-muted-foreground text-sm">by Jane Smith</p>
              </div>
              <span className="text-muted-foreground text-sm">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New User Registered</p>
                <p className="text-muted-foreground text-sm">Alex Johnson</p>
              </div>
              <span className="text-muted-foreground text-sm">1 day ago</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <button className="flex items-center justify-center gap-2 rounded-xl bg-primary p-4 text-primary-foreground">
            <span>Create New Page</span>
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl bg-primary p-4 text-primary-foreground">
            <span>Write New Post</span>
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl bg-primary p-4 text-primary-foreground">
            <span>Manage Users</span>
          </button>
        </div>
      </div>
    </>
  );
};
