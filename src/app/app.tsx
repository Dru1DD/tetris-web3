import { BrowserRouter } from 'react-router';
import { Routing } from './routing';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from '@/providers/user-provider';

const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <Routing />
        </UserProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
