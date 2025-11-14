import { useState } from 'react';
import Dashboard from './components/Dashboard';
import PDV from './components/PDV';
import ProductList from './components/ProductList';
import Cashier from './components/Cashier';

type Tab = 'dashboard' | 'pdv' | 'products' | 'cashier';

function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('pdv');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 1rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '4rem'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            🏪 Sistema PDV
          </h1>
          
          <div style={{
            display: 'flex',
            gap: '0.5rem'
          }}>
            <button
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: currentTab === 'dashboard' ? '#3b82f6' : 'transparent',
                color: currentTab === 'dashboard' ? 'white' : '#6b7280'
              }}
              onClick={() => setCurrentTab('dashboard')}
            >
              📊 Dashboard
            </button>
            
            <button
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: currentTab === 'pdv' ? '#10b981' : 'transparent',
                color: currentTab === 'pdv' ? 'white' : '#6b7280'
              }}
              onClick={() => setCurrentTab('pdv')}
            >
              🛒 PDV
            </button>

            <button
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: currentTab === 'products' ? '#8b5cf6' : 'transparent',
                color: currentTab === 'products' ? 'white' : '#6b7280'
              }}
              onClick={() => setCurrentTab('products')}
            >
              📦 Produtos
            </button>

            <button
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: currentTab === 'cashier' ? '#f59e0b' : 'transparent',
                color: currentTab === 'cashier' ? 'white' : '#6b7280'
              }}
              onClick={() => setCurrentTab('cashier')}
            >
              💰 Caixa
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        {currentTab === 'dashboard' && <Dashboard />}
        {currentTab === 'pdv' && <PDV />}
        {currentTab === 'products' && <ProductList />}
        {currentTab === 'cashier' && <Cashier />}
      </main>
    </div>
  );
}
// const ProductListTest = () => (
//   <div style={{ padding: '2rem', textAlign: 'center' }}>
//     <h1>📦 Tela de Produtos - FUNCIONANDO!</h1>
//     <p>Se você está vendo isso, a navegação está funcionando.</p>
//   </div>
// );
export default App;