import { BrowserRouter } from 'react-router';
import { Routing } from './routing';
import { UserProvider } from '@/providers/user-provider';

const App = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routing />
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;
