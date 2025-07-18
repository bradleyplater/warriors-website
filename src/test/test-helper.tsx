import { BrowserRouter } from 'react-router'
import { DataContext, type DataContextType } from '../../app/contexts/DataContext'

const MockDataProvider = ({ children, mockData }: { 
    children: React.ReactNode, 
    mockData?: DataContextType 
  }) => (
    <DataContext.Provider value={mockData}>
      {children}
    </DataContext.Provider>
  )
  
  // Wrapper component to provide router and data context
  export const TestWrapper = ({ children, mockData }: { 
    children: React.ReactNode, 
    mockData?: DataContextType 
  }) => (
    <BrowserRouter>
      <MockDataProvider mockData={mockData}>
        {children}
      </MockDataProvider>
    </BrowserRouter>
  )