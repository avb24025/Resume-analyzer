import { useState } from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Upload from './component/Upload.jsx';

function App() {

  return (
   <BrowserRouter>
   <Routes>
    <Route path="/" element={<Upload />} />
   </Routes>
   </BrowserRouter>
   
  )
}

export default App;
