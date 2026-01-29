import { useTranslation } from 'react-i18next';
import Button from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Link, useNavigate } from 'react-router-dom';
import { useActionState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { emailSchema, FrontendError, HTTP_STATUS } from '@transcendence/core';
import { authApi } from '../../api/auth-api';

interface LoginState {
  fields?: {
    identifier: string;
    username: string;
  };
  errors?: {
    identifier?: string;
    password?: string;
    form?: string;
  };
  success?: boolean;
}

async function loginAction(prevState: LoginState | null, formData: FormData) {
  const data = Object.fromEntries(formData);
  let username = '';
  const { identifier, password } = data as Record<string, string>;
  const isEmail = emailSchema.safeParse(identifier).success;
  try {
    username = await authApi.login(
      isEmail ? { email: identifier, password } : { username: identifier, password },
    );
    return { success: true, fields: { identifier, username } };
  } catch (err: unknown) {
    const nextState: LoginState = {
      fields: { identifier, username },
      errors: {},
      success: false,
    };
    if (err instanceof FrontendError) {
      if (err.statusCode === HTTP_STATUS.BAD_REQUEST && err.details) {
        if (err.details) {
          err.details.forEach((d) => {
            if (d.field && d.field in nextState.errors!) {
              const key = d.field as keyof NonNullable<LoginState['errors']>;
              nextState.errors![key] = d.reason;
            } else if (d.field) {
              nextState.errors!.form = d.reason;
            }
          });
        }
      } else {
        (nextState.errors as Record<string, string>)['form'] = err.message;
      }
    }
    return nextState;
  }
}

export const LoginForm = () => {
  const { t } = useTranslation();
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const navigate = useNavigate();
  const { login } = useAuth();
  useEffect(() => {
    if (state?.success && state.fields) {
      const username = state.fields.username;
      login({ username: username, avatarUrl: null });
      navigate(`/profile/${username}`);
    }
  }, [state?.success, navigate]);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        name="identifier"
        customType="username"
        defaultValue={state?.fields?.identifier}
        errorMessage={state?.errors?.identifier}
        placeholder={t('fieldtype.username-email')}
      ></Input>
      <Input
        name="password"
        customType="password"
        errorMessage={state?.errors?.password}
        placeholder={t('fieldtype.password')}
      ></Input>
      <Button className="mt-4" type="submit">
        {isPending ? t('auth.processing') : t('auth.login')}
      </Button>

      {state?.errors?.form && <p className="text-red-500 text-sm mb-3">{state.errors.form}</p>}

      <div className="text-xs text-gray-500 mt-5">
        {t('auth.noAccount')}{' '}
        <span>
          <Link className="hover:text-blue-400" to={`/signup`}>
            {t('auth.signup')}
          </Link>
        </span>
      </div>
    </form>
  );
};
