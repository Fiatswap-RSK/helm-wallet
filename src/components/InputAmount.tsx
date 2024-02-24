import { useEffect, useState } from 'react'
import Columns from './Columns'
import { fromSatoshis, toSatoshis } from '../lib/format'

enum Label {
  BTC = 'BTC',
  Sats = 'Sats',
}

function InputAmount({ label, onChange }: any) {
  const [amount, setAmount] = useState('0')
  const [sats, setSats] = useState(true)

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '<']

  useEffect(() => {
    setSats(!/,/.test(amount))
    onChange(sats ? amount : toSatoshis(parseInt(amount)))
  }, [amount])

  const unit = sats ? Label.Sats : Label.BTC
  const className =
    'w-full p-3 pr-6 text-sm text-right font-semibold rounded-l-md -mr-4 bg-gray-100 focus-visible:outline-none'
  const isMobile = /portrait/.test(screen.orientation.type)

  const clickHandler = (key: string) => {
    if (amount === '0' && key === ',') return setAmount('0,')
    if (amount === '0') return setAmount(key)
    if (key === '<') {
      const aux = amount.split('')
      return setAmount(aux.slice(0, aux.length - 1).join(''))
    }
    setAmount(amount + key)
  }

  const alternativeAmount = () => {
    if (!amount) return sats ? '0 BTC' : '0 sats'
    return sats ? fromSatoshis(parseInt(amount)) + ' BTC' : toSatoshis(parseFloat(amount)) + ' sats'
  }

  return (
    <fieldset className='text-left text-gray-800 mt-10 mx-auto'>
      {label ? <label className='block text-sm text-left font-medium mb-1'>{label}</label> : null}
      <div className='flex items-center h-12 rounded-l-md bg-gray-100 mb-2'>
        {isMobile ? (
          <p className={className}>{amount}</p>
        ) : (
          <input type='text' placeholder='0' onChange={(e) => setAmount(e.target.value)} className={className} />
        )}
        <div className='w-16 h-full flex items-center rounded-r-md text-sm bg-gray-500 text-gray-100'>
          <div className='mx-auto font-semibold'>{unit}</div>
        </div>
      </div>
      <p className='text-right text-sm mb-10'>{alternativeAmount()}</p>
      {isMobile ? (
        <Columns cols={3}>
          {keys.map((k) => (
            <p key={k} className='text-center p-4 bg-gray-100' onClick={() => clickHandler(k)}>
              {k}
            </p>
          ))}
        </Columns>
      ) : null}
    </fieldset>
  )
}

export default InputAmount
