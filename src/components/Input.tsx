import Label from './Label'

interface InputProps {
  label?: string
  left?: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  right?: string
  type?: string
}

export default function Input({ label, left, onChange, placeholder, right, type }: InputProps) {
  const commonSidesClassName = 'w-16 pt-3 mx-auto text-sm bg-gray-700 dark:bg-gray-200 text-gray-100 dark:text-gray-800'

  const inputClassName =
    (!left ? 'rounded-l-md' : !right ? 'rounded-r-md' : '') +
    ' w-full p-3 text-sm font-semibold bg-gray-100 dark:bg-gray-700'

  return (
    <fieldset className='w-full text-gray-800 dark:text-gray-100'>
      {label ? <Label text={label} /> : null}
      <div className='flex'>
        {left ? <p className={`${commonSidesClassName} rounded-l-md`}>{left}</p> : null}
        <input className={inputClassName} onChange={onChange} placeholder={placeholder} type={type ?? 'text'} />
        {right ? <p className={`${commonSidesClassName} rounded-r-md`}>{right}</p> : null}
      </div>
    </fieldset>
  )
}
