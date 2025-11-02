import './App.css'
import { UserProvider } from './context/UserContext.jsx'
import AppRoute from './route/AppRoute.jsx'

function App() {


  return (
    <UserProvider>
      <AppRoute />
    </UserProvider>


  )
}

export default App
