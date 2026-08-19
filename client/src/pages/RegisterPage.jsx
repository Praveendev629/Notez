import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, UserPlus, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your name (at least 2 characters)';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setFormError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast('Account created — welcome to Notez!', 'success');
      navigate('/app', { replace: true });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const field = (id, label, Icon, extra) => (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input id={id} {...extra} className="input pl-9" aria-invalid={!!errors[id]} />
      </div>
      {errors[id] && <p className="mt-1 text-xs text-red-500">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="card mt-8 p-7">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Create your account</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Start capturing notes and to-dos in seconds.
        </p>
      </div>

      {formError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {formError}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {field('name', 'Name', UserPlus, {
          type: 'text', autoComplete: 'name', placeholder: 'Ada Lovelace',
          value: form.name, onChange: set('name'),
        })}
        {field('email', 'Email', Mail, {
          type: 'email', autoComplete: 'email', placeholder: 'you@example.com',
          value: form.email, onChange: set('email'),
        })}
        {field('password', 'Password', Lock, {
          type: show ? 'text' : 'password', autoComplete: 'new-password',
          placeholder: '••••••••', value: form.password, onChange: set('password'),
        })}
        {field('confirm', 'Confirm password', Lock, {
          type: show ? 'text' : 'password', autoComplete: 'new-password',
          placeholder: '••••••••', value: form.confirm, onChange: set('confirm'),
        })}

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {show ? 'Hide passwords' : 'Show passwords'}
        </button>

        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Create account
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
          Sign in
        </Link>
      </p>
    </div>
  );
}