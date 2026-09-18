const connectedClasses="bg-emerald-50 text-emerald-700 border-emerald-200";
const preparedClasses="bg-amber-50 text-amber-700 border-amber-200";
export default function StatusBadge({ connected }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap ${connected?connectedClasses:preparedClasses}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${connected?"bg-emerald-500":"bg-amber-400"}`}/>{connected?"Conectado":"Preparado"}
  </span>;
}
