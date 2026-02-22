import { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from '../config'

const s = {
    card: { background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' },
    label: { color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 4 },
    input: { width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: '0.9rem', boxSizing: 'border-box' },
    btn: { padding: '0.6rem 1.2rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
}

export default function POSManager({ token }) {
    const [posTab, setPosTab] = useState('billing')
    const [products, setProducts] = useState([])
    const [sales, setSales] = useState([])
    const [cart, setCart] = useState([])
    const [search, setSearch] = useState('')
    const [discount, setDiscount] = useState(0)
    const [payment, setPayment] = useState('cash')
    const [customer, setCustomer] = useState('')
    const [prodForm, setProdForm] = useState({ name: '', category: '', price: '', cost: '', stock: '', unit: 'pcs' })
    const [msg, setMsg] = useState('')

    const headers = { Authorization: `Bearer ${token}` }

    useEffect(() => { fetchAll() }, [])

    const fetchAll = async () => {
        try {
            const [pRes, sRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/pos/product/all`, { headers }),
                axios.get(`${API_BASE_URL}/pos/sale/all`, { headers }),
            ])
            setProducts(pRes.data)
            setSales(sRes.data)
        } catch (e) { console.log('POS fetch err', e) }
    }

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product_id === product.id)
            if (existing) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
            return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }]
        })
    }

    const removeFromCart = (id) => setCart(prev => prev.filter(i => i.product_id !== id))
    const updateQty = (id, qty) => {
        if (qty < 1) return removeFromCart(id)
        setCart(prev => prev.map(i => i.product_id === id ? { ...i, quantity: qty } : i))
    }

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const total = Math.max(0, subtotal - discount)

    const checkout = async () => {
        if (cart.length === 0) return setMsg('❌ Cart is empty')
        try {
            await axios.post(`${API_BASE_URL}/pos/sale`, {
                customer_name: customer || 'Walk-in',
                items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
                discount: parseFloat(discount) || 0,
                tax: 0,
                payment_method: payment
            }, { headers })
            setCart([]); setDiscount(0); setCustomer(''); setMsg('✅ Sale completed!')
            fetchAll()
        } catch (e) { setMsg('❌ ' + (e.response?.data?.detail || 'Checkout failed')) }
    }

    const addProduct = async () => {
        if (!prodForm.name || !prodForm.price) return setMsg('❌ Name and price required')
        try {
            await axios.post(`${API_BASE_URL}/pos/product`, {
                name: prodForm.name, category: prodForm.category, price: parseFloat(prodForm.price),
                cost: parseFloat(prodForm.cost) || null, stock: parseInt(prodForm.stock) || 0, unit: prodForm.unit
            }, { headers })
            setProdForm({ name: '', category: '', price: '', cost: '', stock: '', unit: 'pcs' })
            setMsg('✅ Product added!'); fetchAll()
        } catch (e) { setMsg('❌ ' + (e.response?.data?.detail || 'Error')) }
    }

    const deleteProduct = async (id) => {
        try { await axios.delete(`${API_BASE_URL}/pos/product/${id}`, { headers }); fetchAll() }
        catch (e) { alert('Error deleting product') }
    }

    const tabStyle = (t) => ({
        ...s.btn, background: posTab === t ? 'linear-gradient(135deg,#f093fb,#f5576c)' : 'rgba(255,255,255,0.07)', color: 'white'
    })

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div>
            <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>🛍️ Point of Sale</h3>
            {msg && <div style={{ padding: '0.75rem 1rem', borderRadius: 8, background: msg.startsWith('✅') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: msg.startsWith('✅') ? '#22c55e' : '#ef4444', marginBottom: '1rem' }}>{msg}</div>}

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {['billing', 'products', 'sales'].map(t => (
                    <button key={t} style={tabStyle(t)} onClick={() => setPosTab(t)}>
                        {t === 'billing' ? '🧾 Billing' : t === 'products' ? '📦 Products' : '📋 Sales History'}
                    </button>
                ))}
            </div>

            {/* BILLING */}
            {posTab === 'billing' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
                    <div>
                        <input style={{ ...s.input, marginBottom: '1rem' }} placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '0.75rem' }}>
                            {filtered.map(p => (
                                <div key={p.id} onClick={() => p.stock > 0 && addToCart(p)} style={{ background: p.stock > 0 ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '1rem', cursor: p.stock > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.2s', border: '1px solid rgba(255,255,255,0.1)', opacity: p.stock > 0 ? 1 : 0.5 }}>
                                    <p style={{ color: 'white', fontWeight: 600, margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>{p.name}</p>
                                    <p style={{ color: '#f093fb', fontWeight: 700, margin: '0 0 0.25rem 0' }}>₹{p.price}</p>
                                    <p style={{ color: p.stock <= 5 ? '#ef4444' : 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: 0 }}>Stock: {p.stock} {p.unit}</p>
                                    {p.category && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', margin: '0.25rem 0 0 0' }}>{p.category}</p>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={s.card}>
                        <p style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>🛒 Cart</p>
                        <input style={{ ...s.input, marginBottom: '0.75rem' }} placeholder="Customer name (optional)" value={customer} onChange={e => setCustomer(e.target.value)} />
                        {cart.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '2rem 0' }}>Add products to cart</p> :
                            cart.map(item => (
                                <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                    <div>
                                        <p style={{ color: 'white', margin: 0, fontSize: '0.9rem' }}>{item.name}</p>
                                        <p style={{ color: '#f093fb', margin: 0, fontSize: '0.8rem' }}>₹{item.price} × {item.quantity}</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <button style={{ ...s.btn, padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={() => updateQty(item.product_id, item.quantity - 1)}>−</button>
                                        <span style={{ color: 'white', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                                        <button style={{ ...s.btn, padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={() => updateQty(item.product_id, item.quantity + 1)}>+</button>
                                        <button style={{ ...s.btn, padding: '0.2rem 0.5rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444' }} onClick={() => removeFromCart(item.product_id)}>✕</button>
                                    </div>
                                </div>
                            ))}
                        <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
                                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>Discount ₹</span>
                                <input style={{ ...s.input, padding: '0.4rem 0.6rem' }} type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                                <span>Total</span><span style={{ color: '#22c55e' }}>₹{total.toFixed(2)}</span>
                            </div>
                            <select style={{ ...s.input, marginBottom: '0.75rem' }} value={payment} onChange={e => setPayment(e.target.value)}>
                                <option value="cash">💵 Cash</option>
                                <option value="card">💳 Card</option>
                                <option value="upi">📱 UPI</option>
                            </select>
                            <button style={{ ...s.btn, width: '100%', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', fontSize: '1rem', padding: '0.8rem' }} onClick={checkout}>✓ Complete Sale</button>
                        </div>
                    </div>
                </div>
            )}

            {/* PRODUCTS */}
            {posTab === 'products' && (
                <div>
                    <div style={s.card}>
                        <p style={{ ...s.label, marginBottom: '1rem' }}>Add Product</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                            {[['name', 'Name *'], ['category', 'Category'], ['price', 'Price *'], ['cost', 'Cost Price'], ['stock', 'Stock'], ['unit', 'Unit']].map(([k, ph]) => (
                                <div key={k}>
                                    <p style={s.label}>{ph}</p>
                                    <input style={s.input} placeholder={ph} value={prodForm[k]} onChange={e => setProdForm({ ...prodForm, [k]: e.target.value })} type={['price', 'cost', 'stock'].includes(k) ? 'number' : 'text'} />
                                </div>
                            ))}
                        </div>
                        <button style={{ ...s.btn, background: 'linear-gradient(135deg,#f093fb,#f5576c)', color: 'white' }} onClick={addProduct}>+ Add Product</button>
                    </div>
                    <div style={s.card}>
                        <p style={{ ...s.label, marginBottom: '1rem' }}>Product Catalog ({products.length})</p>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead><tr>{['Name', 'Category', 'Price', 'Stock', 'Action'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{h}</th>)}</tr></thead>
                            <tbody>{products.map(p => (
                                <tr key={p.id}>
                                    <td style={{ padding: '0.5rem', color: 'white' }}>{p.name}</td>
                                    <td style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>{p.category || '—'}</td>
                                    <td style={{ padding: '0.5rem', color: '#f093fb', fontWeight: 700 }}>₹{p.price}</td>
                                    <td style={{ padding: '0.5rem', color: p.stock <= 5 ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{p.stock} {p.unit}</td>
                                    <td style={{ padding: '0.5rem' }}><button style={{ ...s.btn, padding: '0.25rem 0.6rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.75rem' }} onClick={() => deleteProduct(p.id)}>Remove</button></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* SALES HISTORY */}
            {posTab === 'sales' && (
                <div style={s.card}>
                    <p style={{ ...s.label, marginBottom: '1rem' }}>Sales History ({sales.length})</p>
                    {sales.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.4)' }}>No sales yet</p> :
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead><tr>{['#', 'Customer', 'Items', 'Total', 'Payment', 'Date'].map(h => <th key={h} style={{ textAlign: 'left', padding: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{h}</th>)}</tr></thead>
                            <tbody>{sales.map(sale => (
                                <tr key={sale.id}>
                                    <td style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.5)' }}>#{sale.id}</td>
                                    <td style={{ padding: '0.5rem', color: 'white' }}>{sale.customer_name}</td>
                                    <td style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>{sale.items?.length || 0} items</td>
                                    <td style={{ padding: '0.5rem', color: '#22c55e', fontWeight: 700 }}>₹{sale.total.toFixed(2)}</td>
                                    <td style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>{sale.payment_method}</td>
                                    <td style={{ padding: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{new Date(sale.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}</tbody>
                        </table>}
                </div>
            )}
        </div>
    )
}
