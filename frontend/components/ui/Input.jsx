import { forwardRef, useState } from 'react'

/**
 * Input component with optional label, error state, and password toggle.
 *
 * Usage:
 *   <Input label="Email" type="email" error={errors.email} {...register('email')} />
 *   <Input label="Password" type="password" showToggle />
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    type = 'text',
    showToggle = false, // show/hide toggle for password fields
    className = '',
    id,
    ...props
  },
  ref
) {
  const [visible, setVisible] = useState(false)
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const inputType = showToggle ? (visible ? 'text' : 'password') : type

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-primary mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={`
            input-field pr-${showToggle ? '12' : '4'}
            ${error ? 'border-accent focus:ring-accent/50 focus:border-accent' : ''}
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />

        {showToggle && (
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? '🙈' : '👁️'}
          </button>
        )}
      </div>

      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-text-secondary">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs text-accent font-medium">
          {error}
        </p>
      )}
    </div>
  )
})

export default Input

