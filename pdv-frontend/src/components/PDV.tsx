import React, { useState, useEffect } from 'react';
import { salesService } from '../services/salesService';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

const PDV: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsDataFull = await salesService.getProducts();
      const productsData = productsDataFull.filter((product: any) => product.isActive).sort((a: any, b: any) => a.name.localeCompare(b.name));
      // 🔧 CONVERTER Decimal para number
      const productsWithNumberPrices = productsData.map(product => ({
        ...product,
        price: Number(product.price) // ← CONVERTER AQUI
      }));
      
      setProducts(productsWithNumberPrices);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos. Verifique se o back-end está rodando.');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    if (product.stock === 0) {
      alert('Produto sem estoque!');
      return;
    }

    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.productId === product.id);
      
      if (existingItem) {
        // Verifica se tem estoque suficiente
        if (existingItem.quantity + 1 > product.stock) {
          alert('Estoque insuficiente!');
          return currentCart;
        }
        return currentCart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...currentCart, {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(currentCart => currentCart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    // Encontra o produto para verificar estoque
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock) {
      alert('Estoque insuficiente!');
      return;
    }

    setCart(currentCart =>
      currentCart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const processSale = async () => {
    if (cart.length === 0) {
      alert('Carrinho vazio!');
      return;
    }

    setIsProcessing(true);
    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        paymentMethod
      };

      await salesService.createSale(saleData);
      
      // Limpar carrinho após venda
      setCart([]);
      setSearchTerm('');
      alert('✅ Venda realizada com sucesso!');
      
      // Recarregar produtos para atualizar estoque
      await loadProducts();
    } catch (error: any) {
      console.error('Erro ao processar venda:', error);
      alert(`❌ Erro: ${error.response?.data?.message || 'Erro ao processar venda'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Lista de Produtos - 70% */}
      <div style={{
        flex: 7,
        padding: '1rem',
        overflow: 'auto'
      }}>
        <div style={{
          marginBottom: '1rem'
        }}>
          <input
            type="text"
            placeholder="🔍 Buscar produto..."
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem'
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {filteredProducts.map(product => (
            <button
              key={product.id}
              style={{
                backgroundColor: product.stock === 0 ? '#f3f4f6' : 'white',
                color: product.stock === 0 ? '#9ca3af' : '#1f2937',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                textAlign: 'left',
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
            >
              <div style={{
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                {product.name}
              </div>
              <div style={{
                color: '#059669',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                marginBottom: '0.25rem'
              }}>
                R$ {product.price.toFixed(2)}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: product.stock === 0 ? '#ef4444' : '#6b7280'
              }}>
                Estoque: {product.stock}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Carrinho - 30% */}
      <div style={{
        width: '400px',
        backgroundColor: 'white',
        boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#1f2937'
        }}>
          🛒 Carrinho
        </h2>
        
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '1rem'
        }}>
          {cart.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#6b7280',
              padding: '2rem'
            }}>
              Carrinho vazio
            </div>
          ) : (
            cart.map(item => (
              <div key={item.productId} style={{
                borderBottom: '1px solid #e5e7eb',
                padding: '0.75rem 0'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      marginBottom: '0.25rem'
                    }}>
                      {item.name}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      R$ {item.price.toFixed(2)} × {item.quantity} = R$ {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <button
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        width: '1.5rem',
                        height: '1.5rem',
                        borderRadius: '0.25rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span style={{
                      minWidth: '2rem',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      {item.quantity}
                    </span>
                    <button
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        width: '1.5rem',
                        height: '1.5rem',
                        borderRadius: '0.25rem',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button
                      style={{
                        color: '#ef4444',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        marginLeft: '0.5rem',
                        fontSize: '1.25rem'
                      }}
                      onClick={() => removeFromCart(item.productId)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{
            borderTop: '2px solid #e5e7eb',
            paddingTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#1f2937'
            }}>
              Total: R$ {getTotal().toFixed(2)}
            </div>

            <select
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="dinheiro">💵 Dinheiro</option>
              <option value="cartao_credito">💳 Cartão Crédito</option>
              <option value="cartao_debito">💳 Cartão Débito</option>
              <option value="pix">📱 PIX</option>
            </select>

            <button
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                backgroundColor: isProcessing ? '#9ca3af' : '#10b981',
                color: 'white'
              }}
              onClick={processSale}
              disabled={isProcessing}
            >
              {isProcessing ? '⏳ Processando...' : '✅ Finalizar Venda'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDV;