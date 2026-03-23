import React from 'react'
import { X, Edit3, Plus } from 'lucide-react'

export default function TransactionModal({ isOpen, onClose, onSave, nodes, editingTransaction }){
  if(!isOpen) return null
  const handleSubmit = (e)=>{ e.preventDefault(); const fd=new FormData(e.target); const data={ id: editingTransaction?.id||Date.now(), title: fd.get('title'), amount: Number(fd.get('amount')), category: fd.get('category'), date: fd.get('date') }; onSave(data); onClose(); }
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-3"><h3 className="font-bold">{editingTransaction?'Edit':'New'} Transaction</h3><button onClick={onClose}><X /></button></div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="block text-xs">Title</label><input name="title" defaultValue={editingTransaction?.title||''} required className="w-full border p-2" /></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="text-xs">Amount</label><input name="amount" type="number" defaultValue={editingTransaction?.amount||0} required className="w-full border p-2" /></div><div><label className="text-xs">Date</label><input name="date" type="date" defaultValue={editingTransaction?.date||new Date().toISOString().split('T')[0]} required className="w-full border p-2" /></div></div>
          <div><label className="text-xs">Category</label><select name="category" defaultValue={editingTransaction?.category||nodes[0]?.name} className="w-full border p-2">{nodes.map(n=> <option key={n.id} value={n.name}>{n.name}</option>)}</select></div>
          <div className="flex justify-end"><button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded">Save</button></div>
        </form>
      </div>
    </div>
  )
}