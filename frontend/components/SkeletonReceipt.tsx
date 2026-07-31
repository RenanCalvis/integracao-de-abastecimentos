export default function SkeletonReceipt() {
  return (
    <div className="w-full max-w-md mx-auto py-6 px-4 space-y-6">
      {/* Voltar link skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-4 bg-slate-800 rounded w-36 animate-pulse"></div>
      </div>

      {/* Cupom Térmico Skeleton */}
      <div className="receipt-paper animate-pulse transition-all">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Cabeçalho */}
          <div className="text-center space-y-2 flex flex-col items-center">
            <div className="w-9 h-9 bg-slate-200 rounded-full mb-1"></div>
            <div className="h-5 bg-slate-200 rounded w-48"></div>
            <div className="h-3.5 bg-slate-200 rounded w-36"></div>
            <div className="h-3.5 bg-slate-200 rounded w-40"></div>
          </div>

          <div className="border-t border-dashed border-slate-300"></div>

          {/* Posto / Estabelecimento */}
          <div className="space-y-1.5">
            <div className="h-3 bg-slate-200 rounded w-36"></div>
            <div className="h-4.5 bg-slate-200 rounded w-56"></div>
            <div className="h-3.5 bg-slate-200 rounded w-44"></div>
          </div>

          {/* Filial / Cliente */}
          <div className="space-y-1.5">
            <div className="h-3 bg-slate-200 rounded w-28"></div>
            <div className="h-4 bg-slate-200 rounded w-48"></div>
            <div className="h-3.5 bg-slate-200 rounded w-44"></div>
          </div>

          {/* Motorista e Veículo */}
          <div className="space-y-1.5">
            <div className="h-3 bg-slate-200 rounded w-36"></div>
            <div className="h-4 bg-slate-200 rounded w-40"></div>
            <div className="h-3.5 bg-slate-200 rounded w-36"></div>
            <div className="h-5 bg-slate-200 rounded w-44 mt-1"></div>
          </div>

          <div className="border-t border-dashed border-slate-300"></div>

          {/* Itens Abastecidos */}
          <div className="space-y-3">
            <div className="h-3 bg-slate-200 rounded w-32"></div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="h-4 bg-slate-200 rounded w-36"></div>
                  <div className="h-3 bg-slate-200 rounded w-28"></div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="h-4 bg-slate-200 rounded w-28"></div>
                  <div className="h-3 bg-slate-200 rounded w-24"></div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-slate-900 pt-3"></div>

          {/* Totais */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-200 rounded w-40"></div>
              <div className="h-6 bg-slate-200 rounded w-28"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-slate-200 rounded w-24"></div>
              <div className="h-3.5 bg-slate-200 rounded w-20"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-slate-200 rounded w-24"></div>
              <div className="h-3.5 bg-slate-200 rounded w-44"></div>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-300"></div>

          {/* Rodapé */}
          <div className="text-center space-y-1.5 flex flex-col items-center">
            <div className="h-4 bg-slate-200 rounded w-40"></div>
            <div className="h-3 bg-slate-200 rounded w-52"></div>
          </div>
        </div>

        {/* Botão PDF Skeleton */}
        <div className="pt-2">
          <div className="h-11 bg-slate-800 rounded-xl w-full animate-pulse border border-slate-700"></div>
        </div>
      </div>
    </div>
  );
}
