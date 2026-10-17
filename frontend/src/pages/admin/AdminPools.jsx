import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

const emptyForm = {
    name: "", description: "", intro_type: "image",
    cost_single: 100, cost_ten: 900, total_quantity: 100, is_active: 1
};

export default function AdminPools() {
    const [pools, setPools] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    // 排序模式相關
    const [isSorting, setIsSorting] = useState(false);
    const [sortedPools, setSortedPools] = useState([]);

    const load = () => api.listAllPools().then(setPools).catch((e) => setMsg("載入失敗：" + e.message));

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm });
        setImage(null);
        setShowForm(true);
        setMsg("");
    };

    const openEdit = (p) => {
        setEditingId(p.id);
        setForm({
            name: p.name || "",
            description: p.description || "",
            intro_type: p.intro_type || "image",
            cost_single: p.cost_single,
            cost_ten: p.cost_ten,
            total_quantity: p.total_quantity,
            is_active: p.is_active ? 1 : 0,
        });
        setImage(null);
        setShowForm(true);
        setMsg("");
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        try {
            const fd = new FormData();
            fd.append("name", form.name);
            fd.append("description", form.description);
            fd.append("intro_type", form.intro_type);
            fd.append("cost_single", form.cost_single);
            fd.append("cost_ten", form.cost_ten);
            fd.append("total_quantity", form.total_quantity);
            if (editingId != null) fd.append("is_active", form.is_active);
            if (image) fd.append("image", image);

            if (editingId != null) {
                await api.adminUpdatePool(editingId, fd);
                setMsg("獎池已更新！");
            } else {
                await api.adminCreatePool(fd);
                setMsg("獎池建立成功！");
            }
            closeForm();
            load();
        } catch (err) {
            setMsg("錯誤：" + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (p) => {
        if (!confirm(`確定刪除獎池「${p.name}」？\n（已有抽出紀錄的獎池無法刪除，請改為關閉）`)) return;
        setMsg("");
        try {
            await api.adminDeletePool(p.id);
            setMsg("獎池已刪除");
            load();
        } catch (err) {
            setMsg("錯誤：" + err.message);
        }
    };

    const toggleActive = async (p) => {
        try {
            const fd = new FormData();
            fd.append("is_active", p.is_active ? 0 : 1);
            await api.adminUpdatePool(p.id, fd);
            load();
        } catch (err) {
            setMsg("錯誤：" + err.message);
        }
    };

    // 進入排序模式
    const startSorting = () => {
        setSortedPools([...pools]);
        setIsSorting(true);
        setMsg("");
    };

    // 取消排序
    const cancelSorting = () => {
        setIsSorting(false);
        setSortedPools([]);
    };

    // 上移 / 下移（只改暫存順序）
    const movePool = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= sortedPools.length) return;

        const newList = [...sortedPools];
        const [moved] = newList.splice(index, 1);
        newList.splice(newIndex, 0, moved);
        setSortedPools(newList);
    };

    // 儲存排序
    const saveSorting = async () => {
        setLoading(true);
        setMsg("");
        try {
            // 依目前順序重新設定 sort_order（從 0 開始）
            const updates = sortedPools.map((p, idx) => {
                const fd = new FormData();
                fd.append("sort_order", idx);
                return api.adminUpdatePool(p.id, fd);
            });

            await Promise.all(updates);
            setMsg("排序已儲存！");
            setIsSorting(false);
            setSortedPools([]);
            load();
        } catch (err) {
            setMsg("儲存排序失敗：" + err.message);
        } finally {
            setLoading(false);
        }
    };

    // 顯示用的列表
    const displayPools = isSorting ? sortedPools : pools;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-purple-300">獎池管理</h1>
                <div className="flex gap-2">
                    {!isSorting ? (
                        <>
                            <button
                                onClick={startSorting}
                                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
                            >
                                排序卡池
                            </button>
                            <button
                                onClick={showForm && !editingId ? closeForm : openCreate}
                                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition"
                            >
                                {showForm && !editingId ? "取消" : "+ 新增獎池"}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={saveSorting}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 transition"
                            >
                                {loading ? "儲存中..." : "儲存排序"}
                            </button>
                            <button
                                onClick={cancelSorting}
                                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                            >
                                取消排序
                            </button>
                        </>
                    )}
                </div>
            </div>

            {msg && (
                <div className={`mb-4 text-sm px-3 py-2 rounded ${msg.includes("失敗") || msg.startsWith("錯誤")
                        ? "bg-red-900/40 text-red-300"
                        : "bg-green-900/40 text-green-300"
                    }`}>
                    {msg}
                </div>
            )}

            {showForm && !isSorting && (
                <form onSubmit={handleSubmit} className="bg-dark-800/60 rounded-2xl p-6 border border-purple-900/30 mb-8 space-y-4">
                    <h2 className="text-lg font-semibold text-purple-200">
                        {editingId != null ? `編輯獎池 #${editingId}` : "新增獎池"}
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">獎池名稱 *</label>
                            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">介紹類型</label>
                            <select value={form.intro_type} onChange={(e) => setForm({ ...form, intro_type: e.target.value })}
                                className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-2">
                                <option value="image">圖片介紹</option>
                                <option value="text">文字介紹</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">單抽費用 (pt)</label>
                            <input type="number" min={1} value={form.cost_single} onChange={(e) => setForm({ ...form, cost_single: e.target.value })}
                                className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">十連費用 (pt)</label>
                            <input type="number" min={1} value={form.cost_ten} onChange={(e) => setForm({ ...form, cost_ten: e.target.value })}
                                className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">獎池總數量 *</label>
                            <input type="number" min={1} required value={form.total_quantity} onChange={(e) => setForm({ ...form, total_quantity: e.target.value })}
                                className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-2" />
                            {editingId != null && (
                                <p className="text-xs text-gray-500 mt-1">不可小於已設定的卡面總數；已抽出數量會保留</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">封面圖片{editingId != null ? "（不選則保留原圖）" : ""}</label>
                            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])}
                                className="w-full text-sm text-gray-400" />
                        </div>
                        {editingId != null && (
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">狀態</label>
                                <select value={form.is_active} onChange={(e) => setForm({ ...form, is_active: Number(e.target.value) })}
                                    className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-2">
                                    <option value={1}>開放中</option>
                                    <option value={0}>已關閉</option>
                                </select>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">介紹文字</label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3} className="w-full bg-dark-900 border border-gray-700 rounded-lg px-3 py-2" />
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" disabled={loading}
                            className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50">
                            {loading ? "儲存中..." : (editingId != null ? "儲存修改" : "建立獎池")}
                        </button>
                        <button type="button" onClick={closeForm} className="px-4 py-2 rounded-lg bg-dark-900 text-gray-400">
                            取消
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {displayPools.map((p, index) => (
                    <div key={p.id} className="bg-dark-800/60 rounded-xl p-4 border border-purple-900/20 flex flex-wrap items-center gap-4">
                        {p.image_url ? (
                            <img src={`${API_BASE}${p.image_url}`} alt="" className="w-16 h-16 object-cover rounded-lg" />
                        ) : (
                            <div className="w-16 h-16 bg-dark-900 rounded-lg flex items-center justify-center text-2xl">🎴</div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                                {p.name}
                                {!p.is_active && <span className="ml-2 text-xs text-red-400">已關閉</span>}
                            </div>
                            <div className="text-sm text-gray-400">
                                剩餘 {p.remaining_quantity}/{p.total_quantity} · 單抽 {p.cost_single} · 十連 {p.cost_ten}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            {/* 排序模式才顯示上下按鈕 */}
                            {isSorting && (
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => movePool(index, -1)}
                                        disabled={index === 0}
                                        className="px-2 py-1 rounded bg-dark-900 hover:bg-gray-800 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="上移"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        onClick={() => movePool(index, 1)}
                                        disabled={index === sortedPools.length - 1}
                                        className="px-2 py-1 rounded bg-dark-900 hover:bg-gray-800 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="下移"
                                    >
                                        ↓
                                    </button>
                                </div>
                            )}

                            {!isSorting && (
                                <>
                                    <button onClick={() => openEdit(p)}
                                        className="px-3 py-1.5 rounded-lg bg-blue-900/50 hover:bg-blue-800 text-sm transition">
                                        編輯
                                    </button>
                                    <Link to={`/admin/pools/${p.id}/cards`}
                                        className="px-3 py-1.5 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-sm transition">
                                        管理卡面
                                    </Link>
                                    <button onClick={() => toggleActive(p)}
                                        className="px-3 py-1.5 rounded-lg bg-dark-900 hover:bg-gray-800 text-sm transition">
                                        {p.is_active ? "關閉" : "開啟"}
                                    </button>
                                    <button onClick={() => handleDelete(p)}
                                        className="px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800 text-sm transition text-red-300">
                                        刪除
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
                {displayPools.length === 0 && <p className="text-gray-500">尚無獎池，請先新增</p>}
            </div>
        </div>
    );
}