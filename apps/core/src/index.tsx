import ReactDOM from 'react-dom/client';
import { LinkbApp } from './linkb-app';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<LinkbApp />);
}
