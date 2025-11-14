import React, { useState, useEffect } from "react";
import { salesService } from "../services/salesService";
import type { Product } from "../services/salesService";

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    cost: "",
    stock: "",
    categoryId: "",
    isActive: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await salesService.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      alert("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId
          ? parseInt(formData.categoryId)
          : undefined,
        isActive: formData.isActive,
      };

      if (editingProduct) {
        await salesService.updateProduct(editingProduct.id, productData);
        alert("✅ Produto atualizado com sucesso!");
      } else {
        await salesService.createProduct(productData);
        alert("✅ Produto criado com sucesso!");
      }

      resetForm();
      await loadProducts();
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      alert(`❌ Erro: ${error.message || "Erro ao salvar produto"}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      cost: "",
      stock: "",
      categoryId: "",
      isActive: true,
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      cost: product.cost?.toString() || "",
      stock: product.stock.toString(),
      categoryId: product.categoryId?.toString() || "",
      isActive: product.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) {
      return;
    }

    try {
      // TODO: Implementar delete no service
      await salesService.deleteProduct(productId);
      alert("✅ Produto excluído com sucesso!");
      await loadProducts();
    } catch (error: any) {
      console.error("Erro ao excluir produto:", error);
      alert(`❌ Erro: ${error.message || "Erro ao excluir produto"}`);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "#6b7280",
        }}
      >
        Carregando produtos...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Cabeçalho */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#1f2937",
            margin: 0,
          }}
        >
          📦 Gestão de Produtos
        </h1>

        <button
          style={{
            backgroundColor: "#10b981",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "1rem",
          }}
          onClick={() => setShowForm(true)}
        >
          ➕ Novo Produto
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="🔍 Buscar produtos..."
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid #d1d5db",
            borderRadius: "0.5rem",
            fontSize: "1rem",
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Formulário (Modal) */}
      {showForm && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "2.5rem", // ← MAIS ESPAÇO
            borderRadius: "0.75rem",
            width: "90%",
            maxWidth: "520px", // ← LIGEIRAMENTE MAIOR
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem", // ← MAIS ESPAÇO
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#1f2937",
                margin: 0,
              }}
            >
              {editingProduct ? "✏️ Editar Produto" : "➕ Novo Produto"}
            </h2>
            <button
              onClick={resetForm}
              style={{
                backgroundColor: "transparent",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#6b7280",
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Nome do Produto */}
            <div style={{ marginBottom: "1.5rem" }}> {/* ← MAIS ESPAÇO */}
              <label
                style={{
                  display: "block",
                  marginBottom: "0.75rem", // ← MAIS ESPAÇO
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                style={{
                  width: "100%",
                  padding: "0.875rem", // ← MAIS ESPAÇO INTERNO
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem", // ← BORDA MAIS SUAVE
                  fontSize: "1rem",
                }}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Preço e Custo */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "3rem", // ← MAIS ESPAÇO ENTRE COLUNAS
                marginBottom: "1.5rem", // ← MAIS ESPAÇO
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.75rem", // ← MAIS ESPAÇO
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Preço de Venda *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  style={{
                    width: "100%",
                    padding: "0.875rem", // ← MAIS ESPAÇO INTERNO
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                  }}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.75rem", // ← MAIS ESPAÇO
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Custo
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  style={{
                    width: "100%",
                    padding: "0.875rem", // ← MAIS ESPAÇO INTERNO
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                  }}
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Estoque e Categoria */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "3rem", // ← MAIS ESPAÇO ENTRE COLUNAS
                marginBottom: "1.5rem", // ← MAIS ESPAÇO
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.75rem", // ← MAIS ESPAÇO
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Estoque *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  style={{
                    width: "100%",
                    padding: "0.875rem", // ← MAIS ESPAÇO INTERNO
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                  }}
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.75rem", // ← MAIS ESPAÇO
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Categoria ID
                </label>
                <input
                  type="number"
                  min="0"
                  style={{
                    width: "100%",
                    padding: "0.875rem", // ← MAIS ESPAÇO INTERNO
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                  }}
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Campo Ativo/Inativo (apenas quando editando) */}
            {editingProduct && (
              <div style={{ marginBottom: "2rem" }}> {/* ← MAIS ESPAÇO */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontWeight: "600",
                    color: "#374151",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        isActive: e.target.checked 
                      })
                    }
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                    }}
                  />
                  Produto Ativo
                </label>
                <div style={{ 
                  fontSize: "0.875rem", 
                  color: "#6b7280",
                  marginTop: "0.5rem"
                }}>
                  {formData.isActive 
                    ? "✅ Produto visível no PDV" 
                    : "❌ Produto oculto no PDV"
                  }
                </div>
              </div>
            )}

            {/* Botões */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
                marginTop: "2rem", // ← MAIS ESPAÇO
              }}
            >
              <button
                type="button"
                onClick={resetForm}
                style={{
                  backgroundColor: "#6b7280",
                  color: "white",
                  padding: "0.875rem 1.75rem", // ← MAIS ESPAÇO
                  borderRadius: "0.5rem",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  backgroundColor: "#10b981",
                  color: "white",
                  padding: "0.875rem 1.75rem", // ← MAIS ESPAÇO
                  borderRadius: "0.5rem",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                {editingProduct ? "Atualizar" : "Criar"} Produto
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

      {/* Lista de Produtos */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "0.75rem",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        {filteredProducts.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            {products.length === 0
              ? "Nenhum produto cadastrado"
              : "Nenhum produto encontrado"}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Produto
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Preço
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Custo
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Estoque
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      backgroundColor:
                        product.stock === 0 ? "#fef2f2" : "white",
                    }}
                  >
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: "600", color: "#1f2937" }}>
                        {product.name}
                      </div>
                      {product.categoryId && (
                        <div
                          style={{
                            fontSize: "0.875rem",
                            color: "#6b7280",
                          }}
                        >
                          Categoria: {product.categoryId}
                        </div>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        textAlign: "right",
                        fontWeight: "600",
                        color: "#059669",
                      }}
                    >
                      R$ {product.price.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        textAlign: "right",
                        color: "#6b7280",
                      }}
                    >
                      {product.cost ? `R$ ${product.cost.toFixed(2)}` : "-"}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        textAlign: "center",
                        fontWeight: "600",
                        color: product.stock <= 5 ? "#dc2626" : "#1f2937",
                      }}
                    >
                      {product.stock}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "9999px",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                          backgroundColor: product.isActive
                            ? "#d1fae5"
                            : "#f3f4f6",
                          color: product.isActive ? "#065f46" : "#6b7280",
                        }}
                      >
                        {product.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() => startEdit(product)}
                          style={{
                            backgroundColor: "#3b82f6",
                            color: "white",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.375rem",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          style={{
                            backgroundColor: "#ef4444",
                            color: "white",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.375rem",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resumo */}
      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#6b7280",
          fontSize: "0.875rem",
        }}
      >
        <div>Total: {filteredProducts.length} produto(s)</div>
        <div>
          {products.filter((p) => p.stock <= 5).length} produto(s) com estoque
          baixo
        </div>
      </div>
    </div>
  );
};

export default ProductList;
