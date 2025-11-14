import React, { useState, useEffect } from 'react';
import { cashierService } from '../services/cashierService';

const Cashier: React.FC = () => {
  const [cashierStatus, setCashierStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initialBalance, setInitialBalance] = useState('');
  const [finalBalance, setFinalBalance] = useState('');

  useEffect(() => {
    loadCashierStatus();
  }, []);

  const loadCashierStatus = async () => {
    try {
      setLoading(true);
      const status = await cashierService.getCashierStatus();
      setCashierStatus(status);
    } catch (error) {
      console.error('Erro ao carregar status do caixa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCashier = async () => {
    if (!initialBalance) {
      alert('Informe o saldo inicial!');
      return;
    }

    try {
      await cashierService.openCashier({
        initialBalance: parseFloat(initialBalance)
      });
      alert('✅ Caixa aberto com sucesso!');
      setInitialBalance('');
      await loadCashierStatus();
    } catch (error: any) {
      alert(`❌ Erro: ${error.message}`);
    }
  };

  const handleCloseCashier = async () => {
    if (!finalBalance) {
      alert('Informe o saldo final!');
      return;
    }

    try {
      await cashierService.closeCashier({
        finalBalance: parseFloat(finalBalance)
      });
      alert('✅ Caixa fechado com sucesso!');
      setFinalBalance('');
      await loadCashierStatus();
    } catch (error: any) {
      alert(`❌ Erro: ${error.message}`);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>;
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '2rem',
        color: '#1f2937'
      }}>
        💰 Controle de Caixa
      </h1>

      {/* Status do Caixa */}
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
          Status Atual
        </h2>
        
        {cashierStatus?.isOpen ? (
          <div style={{
            padding: '1rem',
            backgroundColor: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '0.5rem',
            color: '#065f46'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              ✅ Caixa Aberto
            </div>
            <div>Saldo Inicial: R$ {cashierStatus.initialBalance?.toFixed(2)}</div>
            <div>Vendas do Dia: R$ {cashierStatus.totalSales?.toFixed(2)}</div>
            <div>Saldo Esperado: R$ {cashierStatus.expectedBalance?.toFixed(2)}</div>
            <div>Pedidos: {cashierStatus.salesCount}</div>
          </div>
        ) : (
          <div style={{
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            border: '1px solid #6b7280',
            borderRadius: '0.5rem',
            color: '#374151'
          }}>
            ❌ Caixa Fechado
          </div>
        )}
      </div>

      {/* Abrir Caixa */}
      {!cashierStatus?.isOpen && (
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
            Abrir Caixa
          </h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                Saldo Inicial
              </label>
              <input
                type="number"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <button
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              onClick={handleOpenCashier}
            >
              Abrir Caixa
            </button>
          </div>
        </div>
      )}

      {/* Fechar Caixa */}
      {cashierStatus?.isOpen && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem', // ← MAIS ESPAÇO
            color: '#1f2937'
          }}>
            Fechar Caixa
          </h2>
          
          {/* MUDAR PARA FLEX COLUMN */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', // ← COLUNA EM VEZ DE LINHA
            gap: '1.5rem' // ← MAIS ESPAÇO
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem', // ← MAIS ESPAÇO
                fontWeight: '600',
                color: '#374151'
              }}>
                Saldo Final (Dinheiro em Caixa) *
              </label>
              <input
                type="number"
                step="0.01"
                style={{
                  width: '100%', // ← LARGURA TOTAL
                  padding: '0.875rem', // ← MAIS ESPAÇO INTERNO
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
                value={finalBalance}
                onChange={(e) => setFinalBalance(e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            {/* Informações do Fechamento */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                fontWeight: '600', 
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                Resumo do Caixa:
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                <div>Saldo Inicial: R$ {cashierStatus.initialBalance?.toFixed(2)}</div>
                <div>Vendas do Dia: R$ {cashierStatus.totalSales?.toFixed(2)}</div>
                <div>Saldo Esperado: R$ {cashierStatus.expectedBalance?.toFixed(2)}</div>
                {finalBalance && (
                  <div style={{ 
                    marginTop: '0.5rem',
                    fontWeight: '600',
                    color: parseFloat(finalBalance) >= cashierStatus.expectedBalance ? '#059669' : '#dc2626'
                  }}>
                    Diferença: R$ {(parseFloat(finalBalance) - cashierStatus.expectedBalance).toFixed(2)}
                    {parseFloat(finalBalance) >= cashierStatus.expectedBalance ? ' ✅' : ' ❌'}
                  </div>
                )}
              </div>
            </div>

            <button
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '0.875rem 1.5rem', // ← MAIS ESPAÇO
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem',
                width: '100%' // ← LARGURA TOTAL
              }}
              onClick={handleCloseCashier}
              disabled={!finalBalance} // ← DESABILITAR SE VAZIO
            >
              Fechar Caixa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cashier;