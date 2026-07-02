import { useState, useEffect } from "react"
import { Button } from "./components/ui/button"
import "./index.css"

import { 
  LayoutDashboard, Package, Users, Settings, PlusCircle, Trash2, FileText, Calculator, Camera 
} from "lucide-react"

// ... debajo de interface Pedido
interface Producto {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
}

interface Pedido {
  id: string;
  cliente: string;
  producto: string;
  total: number;
  sena: number;
  saldo: number;
  estado: string;
  fecha: string;
}




interface ClienteAgrupado {
  nombre: string;
  count: number;
  totalFacturado: number;
}

const PEDIDOS_INICIALES: Pedido[] = [
  { id: "PG-1001", cliente: "Karol Mati González", producto: "Vinilo Esmerilado x5m", total: 12500, sena: 7000, saldo: 5500, estado: "En Impresión", fecha: "30/06/2026" },
  { id: "PG-1002", cliente: "Eva Tarragona", producto: "Tarjetas Personales x100", total: 4500, sena: 2500, saldo: 2000, estado: "Pendiente", fecha: "29/06/2026" },
  { id: "PG-1003", cliente: "Estudio Alfa", producto: "Cartel Backlight Corpóreo", total: 45000, sena: 45000, saldo: 0, estado: "Entregado", fecha: "25/06/2026" },
  { id: "PG-1004", cliente: "Ferretería Centro", producto: "Imanes Publicitarios x500", total: 8200, sena: 0, saldo: 8200, estado: "Pendiente", fecha: "28/06/2026" },
]

// Definición del tipo de producto
interface Producto {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
}



function App() {
  const [activeTab, setActiveTab] = useState("dashboard")
  
  const [catalogo] = useState<Producto[]>([
  {id: "PG-1001", nombre: "Remera Algodón Negra", precio: 8500, descripcion: "Talle L" },
  { id: "PG-1002", nombre: "Remera Algodón Blanca", precio: 8500, descripcion: "Talle M" },]);
  const [productoEscaneado, setProductoEscaneado] = useState<Producto | null>(null);

  const [pedidos, setPedidos] = useState<Pedido[]>(() => {
    const localData = localStorage.getItem("pg_pedidos")
    return localData ? JSON.parse(localData) : PEDIDOS_INICIALES
  })



  // Configuración operativa
  const [nombreTaller, setNombreTaller] = useState(() => localStorage.getItem("pg_nombre_taller") || "Punto Gráfico")
  const [telefonoTaller, setTelefonoTaller] = useState(() => localStorage.getItem("pg_telefono_taller") || "+54 9 11 1234-5678")
  const [moneda, setMoneda] = useState(() => localStorage.getItem("pg_moneda") || "ARS")
  const [senaMinima, setSenaMinima] = useState(() => localStorage.getItem("pg_sena") || "50")

  // COSTOS BASE
  const [precioMetroLona, setPrecioMetroLona] = useState(() => Number(localStorage.getItem("pg_costo_lona")) || 4500)
  const [precioMetroVinilo, setPrecioMetroVinilo] = useState(() => Number(localStorage.getItem("pg_costo_vinilo")) || 3800)
  const [precioPorHoja, setPrecioPorHoja] = useState(() => Number(localStorage.getItem("pg_precio_hoja")) || 1500)
  const [precioDisenoHora, setPrecioDisenoHora] = useState(() => Number(localStorage.getItem("pg_costo_diseno")) || 2500)

  const [pedidoParaRecibo, setPedidoParaRecibo] = useState<Pedido | null>(null)

  // ESTADOS DEL COTIZADOR INTERACTIVO
  const [tipoTrabajo, setTipoTrabajo] = useState("vinilo")
  const [ancho, setAncho] = useState("")
  const [alto, setAlto] = useState("")
  const [cantidadPiezas, setCantidadPiezas] = useState("1")
  
  // NUEVOS ESTADOS COMPATIBLES CON TU NUEVA LÓGICA AUTOMÁTICA
  const [tarjetasTotalesPedidas, setTarjetasTotalesPedidas] = useState("10") // Cuántas quiere en total
  const [tarjetasQueEntranPorHoja, setTarjetasQueEntranPorHoja] = useState("2") // Cuántas entran por hoja

  const [incluyeDiseno, setIncluyeDiseno] = useState(false)
  const [horasDiseno, setHorasDiseno] = useState("1")
  const [cotizacionResultado, setCotizacionResultado] = useState<number | null>(null)

  // Función matemática helper para calcular las hojas dinámicamente
  const obtenerHojasCalculadas = () => {
    const totales = Number(tarjetasTotalesPedidas) || 0
    const porHoja = Number(tarjetasQueEntranPorHoja) || 1
    if (totales <= 0) return 0
    return Math.ceil(totales / porHoja) // Redondea para arriba para no quedarte corto
  }

  useEffect(() => {
    localStorage.setItem("pg_pedidos", JSON.stringify(pedidos))
  }, [pedidos])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cliente, setCliente] = useState("")
  const [producto, setProducto] = useState("")
  const [total, setTotal] = useState("")
  const [senaIngresada, setSenaIngresada] = useState("")
  const [estado, setEstado] = useState("Pendiente")

  const handleGuardarConfig = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem("pg_nombre_taller", nombreTaller)
    localStorage.setItem("pg_telefono_taller", telefonoTaller)
    localStorage.setItem("pg_moneda", moneda)
    localStorage.setItem("pg_sena", senaMinima)
    
    localStorage.setItem("pg_costo_lona", precioMetroLona.toString())
    localStorage.setItem("pg_costo_vinilo", precioMetroVinilo.toString())
    localStorage.setItem("pg_precio_hoja", precioPorHoja.toString())
    localStorage.setItem("pg_costo_diseno", precioDisenoHora.toString())
    
    alert("¡Configuración y costos de producción actualizados!")
  }

  const handleGuardarPedido = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cliente || !producto || !total) return

    const totalNum = Number(total)
    const senaNum = Number(senaIngresada) || 0
    const saldoNum = totalNum - senaNum

    const nuevoPedido: Pedido = {
      id: `PG-${1000 + pedidos.length + 1}`,
      cliente,
      producto,
      total: totalNum,
      sena: senaNum,
      saldo: saldoNum,
      estado,
      fecha: new Date().toLocaleDateString("es-AR"),
    }

    setPedidos([nuevoPedido, ...pedidos])
    
    setCliente("")
    setProducto("")
    setTotal("")
    setSenaIngresada("")
    setEstado("Pendiente")
    setIsModalOpen(false)
  }

  const calcularPresupuesto = (e: React.FormEvent) => {
    e.preventDefault()
    let subtotalMaterial = 0
    const cantTotales = Number(cantidadPiezas) || 1

    if (tipoTrabajo === "vinilo" || tipoTrabajo === "lona") {
      const metrosCuadrados = (Number(ancho) || 0) * (Number(alto) || 0)
      const precioBase = tipoTrabajo === "vinilo" ? precioMetroVinilo : precioMetroLona
      subtotalMaterial = metrosCuadrados * precioBase * cantTotales
    } else if (tipoTrabajo === "tarjetas") {
      // Usa el cálculo automático de hojas basado en lo que pusiste
      const totalHojas = obtenerHojasCalculadas()
      subtotalMaterial = totalHojas * precioPorHoja
    }

    let costoDisenoExtra = 0
    if (incluyeDiseno) {
      costoDisenoExtra = (Number(horasDiseno) || 0) * precioDisenoHora
    }

    const resultadoFinal = Math.ceil(subtotalMaterial + costoDisenoExtra)
    setCotizacionResultado(resultadoFinal)
  }

  const transformarCotizacionAPedido = () => {
    if (!cotizacionResultado) return
    let detalleProducto = `${tipoTrabajo.toUpperCase()}`
    
    if (tipoTrabajo !== "tarjetas") {
      detalleProducto += ` (${ancho}m x ${alto}m) x${cantidadPiezas}un`
    } else {
      const hojas = obtenerHojasCalculadas()
      detalleProducto += ` x${tarjetasTotalesPedidas} unidades (${hojas} ${hojas === 1 ? 'Hoja' : 'Hojas'} de ${tarjetasQueEntranPorHoja}un)`
    }
    if (incluyeDiseno) detalleProducto += " + Diseño"

    setProducto(detalleProducto)
    setTotal(cotizacionResultado.toString())
    
    const porcen = Number(senaMinima) || 50
    const senaSugerida = Math.ceil((cotizacionResultado * porcen) / 100)
    setSenaIngresada(senaSugerida.toString())
    
    setIsModalOpen(true)
  }

  const handleCambiarEstado = (id: string, nuevoEstado: string) => {
    setPedidos(pedidos.map((p) => p.id === id ? { ...p, estado: nuevoEstado } : p))
  }

  const handleEliminarPedido = (id: string) => {
    if (confirm(`¿Estás seguro de que querés eliminar el pedido ${id}?`)) {
      setPedidos(pedidos.filter((p) => p.id !== id))
    }
  }

  const formatearMoneda = (valor: number) => {
    const numeroSeguro = typeof valor === "number" && !isNaN(valor) ? valor : 0
    return numeroSeguro.toLocaleString("es-AR", {
      style: "currency",
      currency: moneda || "ARS",
      minimumFractionDigits: 0
    })
  }

  const obtenerClientesAgrupados = (): ClienteAgrupado[] => {
    const mapaClientes: Record<string, ClienteAgrupado> = {}
    pedidos.forEach((pedido) => {
      const clienteNormalizado = pedido.cliente ? pedido.cliente.trim() : "Cliente Desconocido"
      if (!mapaClientes[clienteNormalizado]) {
        mapaClientes[clienteNormalizado] = { nombre: clienteNormalizado, count: 0, totalFacturado: 0 }
      }
      mapaClientes[clienteNormalizado].count += 1
      mapaClientes[clienteNormalizado].totalFacturado += (pedido.total || 0)
    })
    return Object.values(mapaClientes)
  }

  return (
    <div className="flex h-screen w-screen bg-slate-950 font-sans text-slate-100 overflow-hidden relative">
      
      {/* SECCIÓN RECIBO IMPRESIÓN */}
      {pedidoParaRecibo && (
        <div className="hidden print:block fixed inset-0 bg-white text-black p-12 z-[9999] font-mono text-sm">
          <div className="border-2 border-black p-8 max-w-2xl mx-auto">
            <div className="text-center border-b-2 border-black pb-4">
              <h1 className="text-2xl font-bold tracking-widest uppercase">{nombreTaller}</h1>
              <p className="text-xs mt-1">SERVICIOS GRÁFICOS E IMPRESIONES</p>
              <p className="text-xs">Tel/WhatsApp: {telefonoTaller}</p>
            </div>
            <div className="flex justify-between my-6 border-b border-dashed border-black pb-4">
              <div>
                <p><strong>RECIBO COBRO N°:</strong> {pedidoParaRecibo.id}</p>
                <p><strong>FECHA:</strong> {pedidoParaRecibo.fecha}</p>
              </div>
              <div className="text-right">
                <p><strong>CLIENTE:</strong> {pedidoParaRecibo.cliente}</p>
              </div>
            </div>
            <table className="w-full text-left my-6 border-collapse">
              <thead>
                <tr className="border-b-2 border-black text-xs">
                  <th className="pb-2">DETALLE DEL TRABAJO / PRODUCTO</th>
                  <th className="pb-2 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-sm">
                  <td className="py-4">{pedidoParaRecibo.producto}</td>
                  <td className="py-4 text-right font-bold">{formatearMoneda(pedidoParaRecibo.total)}</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-8 border-t-2 border-black pt-4 flex flex-col items-end gap-1 text-right">
              <p>TOTAL TRABAJO: <span className="font-bold">{formatearMoneda(pedidoParaRecibo.total)}</span></p>
              <p className="text-emerald-700">SEÑA ABONADA: <span>-{formatearMoneda(pedidoParaRecibo.sena)}</span></p>
              <div className="border-t border-black w-48 mt-1 pt-1 font-bold text-lg text-red-600">PENDIENTE: {formatearMoneda(pedidoParaRecibo.saldo)}</div>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between print:hidden">
        <div>
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-extrabold tracking-tight text-cyan-400">{nombreTaller}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Panel de Administración</p>
          </div>
          <nav className="p-4 flex flex-col gap-1">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "pedidos", label: "Pedidos", icon: Package },
              { id: "cotizador", label: "Cotizador Express", icon: Calculator },
              { id: "clientes", label: "Clientes", icon: Users },
              { id: "inventario", label: "Inventario", icon: Package }, // Nueva opción
              { id: "escanear", label: "Escanear Producto", icon: Camera }, // Nueva opción
              { id: "config", label: "Configuración", icon: Settings },
              { id: "etiquetas", label: "Generar Etiquetas", icon: FileText },
             
            ].map((item) => {
              const IconComponent = item.icon
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left w-full ${activeTab === item.id ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"}`}>
                  <IconComponent className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* CONTENEDOR CENTRAL */}
      <div className="flex-1 flex flex-col overflow-hidden print:hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/20">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Ruta /</span>
            <span className="text-sm font-medium text-cyan-400 capitalize">{activeTab}</span>
          </div>
        </header>

    <main className="flex-1 overflow-y-auto p-8">
          
          {activeTab === "escanear" && (
            <div className="max-w-md mx-auto bg-slate-900 p-8 rounded-xl border border-slate-800 text-center shadow-2xl">
    <h2 className="text-xl font-bold mb-6 text-slate-100">Consultar Producto</h2>
            <p className="text-slate-400 text-sm mb-4">
  Tip: Si usas un celular, al tocar el campo de texto, selecciona "Escanear código" 
  si tu teclado lo permite, o usa un lector QR externo.
</p>
    <input 
      type="text" 
      placeholder="Escanea el código o escribe ID (ej: PG-1001)"
      className="w-full bg-slate-950 border border-slate-700 p-3 rounded-lg mb-4 text-center text-cyan-400 font-mono"
      onChange={(e) => {
        const codigo = e.target.value.toUpperCase();
        const encontrado = catalogo.find(p => p.id === codigo);
        setProductoEscaneado(encontrado || null);
      }}
    />

    

    {productoEscaneado ? (
      <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30">
        <h3 className="text-2xl font-bold text-cyan-400">{productoEscaneado.nombre}</h3>
        <p className="text-slate-400 my-2 text-sm">{productoEscaneado.descripcion}</p>
        <p className="text-4xl font-bold my-4 text-white">{formatearMoneda(productoEscaneado.precio)}</p>
        <Button onClick={() => {
           setProducto(productoEscaneado.nombre);
           setTotal(productoEscaneado.precio.toString());
           setIsModalOpen(true);
        }} className="w-full bg-emerald-600 hover:bg-emerald-500">
          Registrar Venta
        </Button>
      </div>
    ) : (
      <div className="py-12 text-slate-500">
        <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Esperando código...</p>
      </div>
    )}
            </div>
          )}

          {activeTab === "consulta" && (
            <div className="p-4 text-center">
              <h1 className="text-2xl font-bold">Detalle de Producto</h1>
              {/* Aquí pones la lógica que busque el producto por el ID que viene en la URL */}
              <div className="mt-4 p-6 bg-slate-800 rounded-xl">
                <p className="text-xl">{productoEscaneado?.nombre}</p>
                <p className="text-3xl text-cyan-400 font-bold mt-2">
                  {formatearMoneda(productoEscaneado?.precio || 0)}
                </p>
              </div>
            </div>
          )}

          {activeTab === "inventario" && (
            
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">Inventario y Etiquetas</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {catalogo.map((prod) => (
                  <div key={prod.id} className="bg-white p-4 rounded-lg text-center border shadow-sm">
                    <p className="text-black font-bold text-sm">{prod.nombre}</p>
                    {/* Generador automático de QR */}
                    <img 
                      src={`https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${prod.id}`} 
                      alt="QR" className="mx-auto my-2"
                    />
                    <p className="text-cyan-700 font-mono font-bold">{prod.id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Tarjetas de Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Pedidos", val: pedidos.length, color: "text-cyan-400" },
                  { label: "Por Cobrar", val: formatearMoneda(pedidos.reduce((acc, p) => acc + p.saldo, 0)), color: "text-amber-400" },
                  { label: "En Impresión", val: pedidos.filter(p => p.estado === "En Impresión").length, color: "text-purple-400" },
                  { label: "Pagos Recibidos", val: formatearMoneda(pedidos.reduce((acc, p) => acc + p.sena, 0)), color: "text-emerald-400" },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
                    <p className="text-xs text-slate-500 uppercase">{stat.label}</p>
                    <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.val}</p>
                  </div>
                ))}
              </div>

              {/* Botones de Acción Rápida */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Nuevo Pedido", icon: PlusCircle, color: "text-emerald-400", tab: "pedidos" },
                  { label: "Ver Clientes", icon: Users, color: "text-purple-400", tab: "clientes" },
                  { label: "Cotizar", icon: Calculator, color: "text-amber-400", tab: "cotizador" },
                  { label: "Configurar", icon: Settings, color: "text-slate-400", tab: "config" }
                ].map((btn, i) => (
                  <button key={i} onClick={() => setActiveTab(btn.tab)} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col items-center gap-2 hover:border-slate-600 transition-all">
                    <btn.icon className={`h-6 w-6 ${btn.color}`} />
                    <span className="text-xs font-medium text-slate-300">{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* PEDIDOS */}
          {activeTab === "pedidos" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Órdenes de Trabajo</h2>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold gap-2">
                  <PlusCircle className="h-4 w-4" /> Nuevo Pedido
                </Button>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="p-4">ID</th>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Producto</th>
                      <th className="p-4">Total</th>
                      <th className="p-4 text-emerald-400">Seña</th>
                      <th className="p-4 text-amber-500">Saldo</th>
                      <th className="p-4 text-center">Estado</th>
                      <th className="p-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {pedidos.map((pedido) => (
                      <tr key={pedido.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-mono text-cyan-400">{pedido.id}</td>
                        <td className="p-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                            {pedido.cliente.substring(0, 2).toUpperCase()}
                          </div>
                          {pedido.cliente}
                        </td>
                        <td className="p-4 text-slate-400">{pedido.producto}</td>
                        <td className="p-4 font-medium">{formatearMoneda(pedido.total)}</td>
                        <td className="p-4 text-emerald-400">{formatearMoneda(pedido.sena)}</td>
                        <td className="p-4 font-bold text-amber-500">{pedido.saldo > 0 ? formatearMoneda(pedido.saldo) : "PAGADO"}</td>
                        <td className="p-4 text-center">
                          <select 
                            value={pedido.estado} 
                            onChange={(e) => handleCambiarEstado(pedido.id, e.target.value)} 
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              pedido.estado === "Pendiente" ? "bg-amber-500/10 border-amber-500 text-amber-500" :
                              pedido.estado === "En Impresión" ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" :
                              "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                            }`}
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Impresión">En Impresión</option>
                            <option value="Entregado">Entregado</option>
                          </select>
                        </td>
                        <td className="p-4 flex gap-2 justify-center">
                          <Button variant="ghost" onClick={() => setPedidoParaRecibo(pedido)} className="h-8 w-8 p-0 text-cyan-400"><FileText className="h-4 w-4" /></Button>
                          <Button variant="ghost" onClick={() => handleEliminarPedido(pedido.id)} className="h-8 w-8 p-0 text-red-400"><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}



          {/* COTIZADOR EXPRESS */}
          {activeTab === "cotizador" && (
            <div className="flex flex-col gap-6 max-w-4xl">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Calculadora de Presupuestos de Mostrador</h2>
                <p className="text-sm text-slate-500 mt-1">Calculá valores en el acto según las medidas o cantidad de pliegos/hojas.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <form onSubmit={calcularPresupuesto} className="md:col-span-2 p-6 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Tipo de Trabajo / Material</label>
                    <select 
                      value={tipoTrabajo} 
                      onChange={(e) => { setTipoTrabajo(e.target.value); setCotizacionResultado(null); }}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="vinilo">🖨️ Vinilo Impreso (por m²)</option>
                      <option value="lona">🖼️ Lona Frontlight / Banner (por m²)</option>
                      <option value="tarjetas">📇 Tarjetas / Impresiones por Hoja</option>
                    </select>
                  </div>

                  {tipoTrabajo !== "tarjetas" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-medium">Ancho (en metros)</label>
                        <input type="number" step="0.01" value={ancho} onChange={(e) => { setAncho(e.target.value); setCotizacionResultado(null); }} placeholder="Ej: 1.20" className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500" required />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-medium">Alto (en metros)</label>
                        <input type="number" step="0.01" value={alto} onChange={(e) => { setAlto(e.target.value); setCotizacionResultado(null); }} placeholder="Ej: 0.80" className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500" required />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 p-4 bg-slate-950 border border-slate-800 rounded-lg">
                      
                      {/* INPUT 1: Cuántas tarjetas en total necesita hacer */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">1. Cantidad Total de Tarjetas a entregar</label>
                        <input 
                          type="number" 
                          value={tarjetasTotalesPedidas} 
                          onChange={(e) => { setTarjetasTotalesPedidas(e.target.value); setCotizacionResultado(null); }} 
                          min="1"
                          placeholder="Ej: 10" 
                          className="bg-slate-900 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500" 
                          required 
                        />
                      </div>

                      {/* INPUT 2: Cuántas entran por hoja */}
                      <div className="flex flex-col gap-1.5 border-t border-slate-800/60 pt-3">
                        <label className="text-xs text-slate-400 font-medium">2. ¿Cuántas entran por hoja?</label>
                        <input 
                          type="number" 
                          value={tarjetasQueEntranPorHoja} 
                          onChange={(e) => { setTarjetasQueEntranPorHoja(e.target.value); setCotizacionResultado(null); }} 
                          min="1"
                          placeholder="Ej: 2" 
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-slate-600" 
                          required 
                        />
                      </div>

                      {/* CARTEL INFORMATIVO DEL ROJO/CÁLCULO AUTOMÁTICO */}
                      <div className="mt-2 p-2.5 rounded bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex justify-between items-center">
                        <span>Hojas resultantes a imprimir:</span>
                        <span className="font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {obtenerHojasCalculadas()} {obtenerHojasCalculadas() === 1 ? 'hoja' : 'hojas'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 items-end">
                    {tipoTrabajo !== "tarjetas" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-400 font-medium">Cantidad de Piezas Iguales</label>
                        <input 
                          type="number" 
                          value={cantidadPiezas} 
                          onChange={(e) => { setCantidadPiezas(e.target.value); setCotizacionResultado(null); }} 
                          min="1" 
                          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500" 
                          required 
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 h-10 border border-slate-800/60 bg-slate-950/40 rounded-lg px-3 w-full">
                      <input type="checkbox" id="disenoCheck" checked={incluyeDiseno} onChange={(e) => { setIncluyeDiseno(e.target.checked); setCotizacionResultado(null); }} className="accent-cyan-500 h-4 w-4 rounded cursor-pointer" />
                      <label htmlFor="disenoCheck" className="text-xs text-slate-300 select-none cursor-pointer">¿Requiere diseño / retoque?</label>
                    </div>
                  </div>

                  {incluyeDiseno && (
                    <div className="flex flex-col gap-1.5 p-4 bg-slate-950 border border-slate-800 rounded-lg">
                      <label className="text-xs text-slate-400 font-medium">Horas estimadas de diseño profesional</label>
                      <input type="number" value={horasDiseno} onChange={(e) => { setHorasDiseno(e.target.value); setCotizacionResultado(null); }} min="1" className="bg-slate-950 border border-slate-800 w-full sm:w-32 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500" />
                    </div>
                  )}

                  <Button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 mt-2">
                    Calcular Valor Sugerido
                  </Button>
                </form>

                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900 flex flex-col justify-between text-center gap-4">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Precio de Venta</h3>
                    <p className="text-xs text-slate-500 mt-1">Margen calculado en tiempo real</p>
                  </div>

                  <div className="py-6 bg-slate-950 border border-slate-800/60 rounded-xl flex flex-col gap-2 justify-center items-center">
                    {cotizacionResultado !== null ? (
                      <>
                        <div className="flex flex-col gap-1">
                          <span className="text-4xl font-extrabold text-emerald-400">{formatearMoneda(cotizacionResultado)}</span>
                          <span className="text-[10px] uppercase font-mono text-slate-500 tracking-widest">Sugerido Final</span>
                        </div>
                        {tipoTrabajo === "tarjetas" && (
                          <div className="text-xs text-cyan-400 font-mono mt-1 bg-cyan-500/5 px-3 py-1 rounded-full border border-cyan-500/10">
                            Pliegos: {obtenerHojasCalculadas()} (${precioPorHoja} c/u)
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-sm font-mono text-slate-600">Esperando datos...</span>
                    )}
                  </div>

                  <Button type="button" disabled={cotizacionResultado === null} onClick={transformarCotizacionAPedido} className={`w-full font-semibold ${cotizacionResultado !== null ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}>
                    Convertir en Pedido Real
                  </Button>
                </div>
              </div>
            </div>
          )}



          {/* CLIENTES */}
          {activeTab === "clientes" && (
            <div className="flex flex-col gap-6">
              <div><h2 className="text-2xl font-bold tracking-tight">Cartera de Clientes</h2></div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="p-4">Cliente</th>
                      <th className="p-4 text-center">Trabajos Solicitados</th>
                      <th className="p-4 text-right">Total Facturado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {obtenerClientesAgrupados().map((cl, index) => (
                      <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-medium text-slate-200 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">{cl.nombre ? cl.nombre.substring(0, 2).toUpperCase() : "CL"}</div>
                          {cl.nombre}
                        </td>
                        <td className="p-4 text-center font-mono text-slate-400">{cl.count} pedidos</td>
                        <td className="p-4 text-right font-mono font-medium text-emerald-400">{formatearMoneda(cl.totalFacturado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONFIGURACIÓN */}
          {activeTab === "config" && (
            <form onSubmit={handleGuardarConfig} className="flex flex-col gap-6 max-w-4xl">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Configuración del Sistema</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">Datos del Taller</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400">Nombre de la Empresa</label>
                    <input type="text" value={nombreTaller} onChange={(e) => setNombreTaller(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400">Teléfono / WhatsApp</label>
                    <input type="text" value={telefonoTaller} onChange={(e) => setTelefonoTaller(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500" required />
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs text-slate-400">Seña Mínima (%)</label>
                    <input type="number" value={senaMinima} onChange={(e) => setSenaMinima(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500" min="0" max="100" />
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Valores de Venta (Insumos Base)</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400">Moneda del Sistema</label>
                    <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500">
                      <option value="ARS">Peso Argentino ($ ARS)</option>
                      <option value="USD">Dólar Estadounidense (US$)</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400">M² Vinilo Impreso</label>
                      <input type="number" value={precioMetroVinilo} onChange={(e) => setPrecioMetroVinilo(Number(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400">M² Lona Frontlight</label>
                      <input type="number" value={precioMetroLona} onChange={(e) => setPrecioMetroLona(Number(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400 font-bold text-emerald-400">Precio por Hoja Imp.</label>
                      <input type="number" value={precioPorHoja} onChange={(e) => setPrecioPorHoja(Number(e.target.value))} className="bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-400">Hora de Diseño Técnico</label>
                      <input type="number" value={precioDisenoHora} onChange={(e) => setPrecioDisenoHora(Number(e.target.value))} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500" required />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6">Guardar Configuración</Button>
              </div>
            </form>
          )}

          {activeTab === "etiquetas" && (
            <div className="grid grid-cols-2 gap-4">
              {catalogo.map((prod) => (
                <div key={prod.id} className="bg-white p-4 border rounded shadow text-center">
                  <p className="text-black font-bold">{prod.nombre}</p>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${prod.id}`} className="mx-auto" />
                  <p className="text-black font-mono">{prod.id}</p>
                </div>
              ))}
            </div>
       )}
        </main>
      </div>

      {/* MODAL REGISTRAR NUEVA ORDEN */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Registrar Nueva Orden</h3>
            </div>
            <form onSubmit={handleGuardarPedido} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Nombre del Cliente</label>
                <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Producto / Trabajo</label>
                <input type="text" value={producto} onChange={(e) => setProducto(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-400">Total ({moneda})</label>
                  <input type="number" value={total} onChange={(e) => setTotal(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-400">Monto Seña ({moneda})</label>
                  <input type="number" value={senaIngresada} onChange={(e) => setSenaIngresada(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-2 pt-2 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-400">Cancelar</Button>
                <Button type="submit" className="bg-cyan-500 text-slate-950 font-semibold">Guardar Orden</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECCIÓN ESCÁNER */}

    </div>
  )
}

export default App