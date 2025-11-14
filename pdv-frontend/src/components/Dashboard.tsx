import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { DashboardData } from '../services/dashboardService';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getDashboard();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        Carregando dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#ef4444'
      }}>
        ❌ {error}
        <br />
        <button 
          onClick={loadDashboard}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Cabeçalho */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: 0
        }}>
          📊 Dashboard
        </h1>
        <div style={{
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          {dashboardData.summary.date}
        </div>
      </div>

      {/* Cards de Métricas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Vendas Hoje</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            R$ {dashboardData.summary.totalSales.toFixed(2)}
          </div>
        </div>

        <div style={{
          backgroundColor: '#10b981',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛒</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Pedidos</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {dashboardData.summary.totalOrders}
          </div>
        </div>

        <div style={{
          backgroundColor: '#8b5cf6',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Itens Vendidos</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {dashboardData.summary.totalItemsSold}
          </div>
        </div>

        <div style={{
          backgroundColor: dashboardData.summary.isCashierOpen ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Caixa</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {dashboardData.summary.isCashierOpen ? 'Aberto' : 'Fechado'}
          </div>
        </div>
      </div>

      {/* Formas de Pagamento */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          Formas de Pagamento
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {dashboardData.paymentMethods.map((method) => (
            <div key={method.method} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.375rem'
            }}>
              <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                {method.method}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: '600' }}>
                  R$ {method.total.toFixed(2)}
                </span>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280',
                  backgroundColor: '#e5e7eb',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem'
                }}>
                  {method.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Produtos com Estoque Baixo */}
      {dashboardData.lowStockProducts.length > 0 && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#92400e'
          }}>
            ⚠️ Produtos com Estoque Baixo
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {dashboardData.lowStockProducts.map((product) => (
              <div key={product.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem'
              }}>
                <span style={{ fontWeight: '500' }}>{product.name}</span>
                <span style={{ 
                  color: '#dc2626',
                  fontWeight: '600'
                }}>
                  Estoque: {product.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;