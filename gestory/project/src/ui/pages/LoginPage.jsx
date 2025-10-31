import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AuthUseCases } from '../../application/usecases/AuthUseCases.js';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';
import { Mail, Lock, Building2 } from 'lucide-react';
import Swal from 'sweetalert2';
import './LoginPage.scss';

const authUseCases = new AuthUseCases();

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authUseCases.login(data.email, data.password);
      navigate('/admin/dashboard');
    } catch (error) {
      Swal.fire({
        title: 'Error de autenticación',
        text: error.message,
        icon: 'error',
        confirmButtonText: 'Intentar de nuevo'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <Building2 size={40} />
          </div>
          <h1>Panel de Administración</h1>
          <p>Gestor de Eventos y Edificios</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Correo electrónico"
            type="email"
            icon={<Mail size={18} />}
            error={errors.email?.message}
            {...register('email', {
              required: 'El correo es requerido',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Formato de correo inválido'
              }
            })}
          />

          <Input
            label="Contraseña"
            type="password"
            icon={<Lock size={18} />}
            error={errors.password?.message}
            {...register('password', {
              required: 'La contraseña es requerida',
              minLength: {
                value: 6,
                message: 'Mínimo 6 caracteres'
              }
            })}
          />

          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            className="login-btn"
          >
            Iniciar Sesión
          </Button>
        </form>

        <div className="login-footer">
          <p>Solo administradores pueden acceder a este panel</p>
        </div>
      </div>
    </div>
  );
}