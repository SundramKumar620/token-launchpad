import React, { useState } from 'react';

const defaultForm = {
    name: '',
    symbol: '',
    decimals: '9',
    supply: '1000000',
    imageUri: '',
    description: '',
};

export default function TokenForm({ disabled, loading, onSubmit }) {
    const [form, setForm] = useState(defaultForm);

    const update = (field) => (e) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.symbol.trim()) return;
        onSubmit({
            name: form.name.trim(),
            symbol: form.symbol.trim(),
            decimals: parseInt(form.decimals, 10) || 9,
            supply: parseInt(form.supply, 10) || 1000000,
            imageUri: form.imageUri.trim(),
            description: form.description.trim(),
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-grid">
                {/* Name */}
                <div className="form-group">
                    <label>Token Name *</label>
                    <input
                        type="text"
                        placeholder="e.g. My Token"
                        value={form.name}
                        onChange={update('name')}
                        required
                    />
                </div>

                {/* Symbol */}
                <div className="form-group">
                    <label>Symbol *</label>
                    <input
                        type="text"
                        placeholder="e.g. MTK"
                        value={form.symbol}
                        onChange={update('symbol')}
                        required
                    />
                </div>

                {/* Decimals */}
                <div className="form-group">
                    <label>Decimals</label>
                    <input
                        type="number"
                        min="0"
                        max="9"
                        placeholder="9"
                        value={form.decimals}
                        onChange={update('decimals')}
                    />
                </div>

                {/* Supply */}
                <div className="form-group">
                    <label>Initial Supply</label>
                    <input
                        type="number"
                        min="1"
                        placeholder="1000000"
                        value={form.supply}
                        onChange={update('supply')}
                    />
                </div>

                {/* Image URI */}
                <div className="form-group full">
                    <label>Image URL</label>
                    <input
                        type="url"
                        placeholder="https://example.com/token-logo.png"
                        value={form.imageUri}
                        onChange={update('imageUri')}
                    />
                </div>

                {/* Description */}
                <div className="form-group full">
                    <label>Description</label>
                    <textarea
                        placeholder="A short description of your token..."
                        value={form.description}
                        onChange={update('description')}
                    />
                </div>
            </div>

            <button
                type="submit"
                className={`btn-create ${loading ? 'loading' : ''}`}
                disabled={disabled || loading}
            >
                {loading ? 'Creating...' : 'Create Token'}
            </button>
        </form>
    );
}
