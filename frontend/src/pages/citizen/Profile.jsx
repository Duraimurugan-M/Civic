import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman & Nicobar','Chandigarh','Dadra & Nagar Haveli','Daman & Diu',
  'Delhi','Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry',
];

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const fileRef = useRef();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    name:     user?.name     || '',
    phone:    user?.phone    || '',
    dob:      user?.dob      || '',
    address:  user?.address  || '',
    city:     user?.city     || '',
    district: user?.district || '',
    state:    user?.state    || '',
    pincode:  user?.pincode  || '',
  });
  const [avatar, setAvatar] = useState(null);
  const [pwForm, setPw]     = useState({ currentPassword: '', newPassword: '' });
  const [showPw, setShowPw] = useState(false);

  const requiredFields = [
    { key: 'name',     label: 'Full Name' },
    { key: 'phone',    label: 'Phone Number' },
    { key: 'dob',      label: 'Date of Birth' },
    { key: 'address',  label: 'Address' },
    { key: 'city',     label: 'City' },
    { key: 'district', label: 'District' },
    { key: 'state',    label: 'State' },
    { key: 'pincode',  label: 'Pincode' },
  ];
  const missingFields = requiredFields.filter(f => !form[f.key]?.trim());

  const updateProfile = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (avatar) fd.append('avatar', avatar);
      return authAPI.updateFullProfile(fd);
    },
    onSuccess: res => {
      setUser(res.data.user);
      toast.success('Profile saved successfully!');
      qc.invalidateQueries(['me']);
    },
    onError: e => toast.error(e.response?.data?.message || 'Failed to save profile'),
  });

  const changePassword = useMutation({
    mutationFn: () => authAPI.changePassword(pwForm),
    onSuccess: () => {
      toast.success('Password updated successfully!');
      setPw({ currentPassword: '', newPassword: '' });
    },
    onError: e => toast.error(e.response?.data?.message || 'Error updating password'),
  });

  const set = key => e => setForm(p => ({ ...p, [key]: e.target.value }));
  const avatarSrc = avatar ? URL.createObjectURL(avatar) : user?.avatar;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Keep your information up to date</p>
      </div>

      {/* Incomplete warning */}
      {missingFields.length > 0 && (
        <div className="rounded-2xl p-4"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <p className="text-sm font-bold text-amber-800 mb-1">⚠️ Profile Incomplete</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Please fill in the following required fields:{' '}
            <strong>{missingFields.map(f => f.label).join(', ')}</strong>
          </p>
        </div>
      )}

      {/* Profile card */}
      <div className="card space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Personal Information</h2>
          {user?.profileComplete && (
            <span className="badge bg-emerald-100 text-emerald-700">✓ Complete</span>
          )}
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer flex-shrink-0"
            onClick={() => fileRef.current?.click()}>
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-white text-2xl font-bold shadow"
              style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}
            >
              {avatarSrc
                ? <img src={avatarSrc} className="w-full h-full object-cover" alt="" />
                : user?.name?.[0]?.toUpperCase()}
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow"
              style={{ background: '#2563EB' }}>✎</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => setAvatar(e.target.files[0])} />
          <div>
            <p className="font-bold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
            {user?.citizenId && (
              <p className="text-xs font-mono text-primary mt-0.5">{user.citizenId}</p>
            )}
            <span className="badge bg-blue-100 text-blue-700 capitalize mt-1.5">{user?.role}</span>
          </div>
        </div>

        {/* Form fields — 2 column grid on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Full Name *
            </label>
            <input className="input" value={form.name} onChange={set('name')}
              placeholder="Your full name" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Phone Number *
            </label>
            <input className="input" value={form.phone} onChange={set('phone')}
              placeholder="10-digit mobile number" maxLength={10} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Date of Birth *
            </label>
            <input type="date" className="input" value={form.dob} onChange={set('dob')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Aadhaar Number
            </label>
            <input className="input bg-slate-50 cursor-not-allowed" readOnly
              value={user?.aadhaarNumber || ''} />
            <p className="text-[10px] text-slate-400 mt-0.5">Cannot be changed after registration</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Address *
            </label>
            <textarea className="input resize-none" rows={2} value={form.address}
              onChange={set('address')} placeholder="Door no, Street name, Area" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              City *
            </label>
            <input className="input" value={form.city} onChange={set('city')}
              placeholder="Eg: Chennai" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              District *
            </label>
            <input className="input" value={form.district} onChange={set('district')}
              placeholder="Eg: Namakkal" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              State *
            </label>
            <select className="input" value={form.state} onChange={set('state')}>
              <option value="">— Select State —</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Pincode *
            </label>
            <input className="input" value={form.pincode} onChange={set('pincode')}
              placeholder="6-digit pincode" maxLength={6} />
          </div>
        </div>

        <button
          onClick={() => updateProfile.mutate()}
          disabled={updateProfile.isPending}
          className="btn-primary py-3"
        >
          {updateProfile.isPending ? <Spinner size="sm" /> : '💾 Save Profile'}
        </button>
      </div>

      {/* Change Password */}
      <div className="card space-y-4">
        <h2 className="section-title">Change Password</h2>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Current Password
          </label>
          <input type={showPw ? 'text' : 'password'} className="input"
            value={pwForm.currentPassword}
            onChange={e => setPw(p => ({ ...p, currentPassword: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} className="input pr-14"
              value={pwForm.newPassword}
              onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))} />
            <button type="button" onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <button
          onClick={() => changePassword.mutate()}
          disabled={changePassword.isPending}
          className="btn-primary py-3"
        >
          {changePassword.isPending ? <Spinner size="sm" /> : '🔒 Update Password'}
        </button>
      </div>
    </div>
  );
}