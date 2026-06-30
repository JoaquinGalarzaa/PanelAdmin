import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 bg-slate-950 text-white">
      <h1 className="text-4xl font-extrabold tracking-tight text-cyan-400">
        Punto Gráfico — Panel Admin
      </h1>
      
      <p className="text-slate-400">
        Si ves el fondo oscuro y este texto gris, ¡Tailwind v4 funciona perfectamente!
      </p>

      <div className="flex gap-4">
        {/* 1. Botón HTML nativo para probar Tailwind puro */}
        <button className="rounded-md bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400">
          Botón Tailwind Puro
        </button>

        {/* 2. Botón oficial de Shadcn usando variantes */}
        <Button variant="default">
          Botón Shadcn Oficial
        </Button>
      </div>
    </div>
  )
}

export default App