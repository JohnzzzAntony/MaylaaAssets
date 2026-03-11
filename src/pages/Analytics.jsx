import React, { useState, useEffect } from 'react';
import { fetchAllAssets } from '../utils/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Package, Users, Layers } from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#8b5cf6'];

const Analytics = () => {
    const [allAssets, setAllAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllAssets().then(data => {
            setAllAssets(data);
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <div style={{ padding: '100px 0', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Calculating global analytics...</p>
        </div>
    );

    // Derived Data
    const totalAssets = allAssets.length;
    const entitiesCount = new Set(allAssets.map(a => a.Entity)).size;
    const categoriesCount = new Set(allAssets.map(a => a.category)).size;

    // Category Distribution (Pie Chart)
    const categoryDataMap = allAssets.reduce((acc, asset) => {
        acc[asset.category] = (acc[asset.category] || 0) + 1;
        return acc;
    }, {});
    const categoryChartData = Object.keys(categoryDataMap).map(cat => ({
        name: cat,
        value: categoryDataMap[cat]
    }));

    // Entity Distribution (Bar Chart)
    const entityDataMap = allAssets.reduce((acc, asset) => {
        const entity = asset.Entity || 'Unassigned';
        acc[entity] = (acc[entity] || 0) + 1;
        return acc;
    }, {});
    const entityChartData = Object.keys(entityDataMap).map(ent => ({
        name: ent.split(' ').map(w => w[0]).join(''), // Abbreviate for X-Axis
        fullName: ent,
        count: entityDataMap[ent]
    }));

    const MetricCard = ({ icon: Icon, title, value }) => (
        <div className="glass" style={{ padding: '32px', flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '16px', border: '1px solid var(--border-glow)' }}>
                    <Icon size={28} color="var(--primary)" />
                </div>
                <div>
                    <h4 style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h4>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white', marginTop: '4px' }}>{value}</div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
            <div className="header">
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Global Intelligence</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Cross-entity asset distribution and infrastructure insights.</p>
                </div>
            </div>

            {/* Metric Overview */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <MetricCard icon={TrendingUp} title="Total Assets" value={totalAssets} />
                <MetricCard icon={Users} title="Active Entities" value={entitiesCount} />
                <MetricCard icon={Layers} title="Asset Categories" value={categoriesCount} />
                <MetricCard icon={Package} title="Avg per Entity" value={(totalAssets / (entitiesCount || 1)).toFixed(1)} />
            </div>

            {/* Charts Section */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {/* Category Pie Chart */}
                <div className="glass" style={{ flex: '1', minWidth: '400px', height: '480px', padding: '32px' }}>
                    <h3 style={{ marginBottom: '32px', fontSize: '1.25rem' }}>Asset Categories</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <PieChart>
                            <Pie
                                data={categoryChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={8}
                                dataKey="value"
                            >
                                {categoryChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ background: '#0f0f13', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                itemStyle={{ color: 'white' }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Entity Bar Chart */}
                <div className="glass" style={{ flex: '1.5', minWidth: '400px', height: '480px', padding: '32px' }}>
                    <h3 style={{ marginBottom: '32px', fontSize: '1.25rem' }}>Entity Deployment</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={entityChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} axisLine={false} tickLine={false} />
                            <YAxis stroke="var(--text-dim)" fontSize={12} axisLine={false} tickLine={false} />
                            <Tooltip 
                                cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                                contentStyle={{ background: '#0f0f13', border: '1px solid var(--border)', borderRadius: '12px' }}
                                itemStyle={{ color: 'var(--primary)' }}
                                formatter={(value, name, props) => [value, props.payload.fullName]}
                            />
                            <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed List Section */}
            <div className="glass" style={{ padding: '32px' }}>
                <h3 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Consolidated Reports</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {[...entityChartData].sort((a,b) => b.count - a.count).map((ent, idx) => (
                        <div key={idx} className="glass-card" style={{ 
                            padding: '20px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center' 
                        }}>
                            <span style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '0.95rem' }}>{ent.fullName}</span>
                            <span className="badge badge-success">
                                {ent.count} Assets
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
