import { useContext, useState } from 'react'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Title from '../../components/Title'
import { NavigationContext, Pages } from '../../providers/navigation'
import { getXPubs } from '../../lib/derivation'
import { WalletContext } from '../../providers/wallet'
import Content from '../../components/Content'
import NewPassword from '../../components/NewPassword'
import { saveMnemonic } from '../../lib/storage'
import { FlowContext } from '../../providers/flow'
import { ConfigContext } from '../../providers/config'
import Container from '../../components/Container'

function InitPassword() {
  const { navigate } = useContext(NavigationContext)
  const { config, updateConfig } = useContext(ConfigContext)
  const { wallet, updateWallet } = useContext(WalletContext)
  const { initInfo } = useContext(FlowContext)

  const [label, setLabel] = useState('')
  const [password, setPassword] = useState('')

  const handleCancel = () => navigate(Pages.Init)

  const handleProceed = () => {
    const { mnemonic } = initInfo
    saveMnemonic(mnemonic, password)
    getXPubs(mnemonic).then((xpubs) => {
      updateConfig(config)
      updateWallet({ ...wallet, initialized: true, xpubs })
      navigate(Pages.Wallet)
    })
  }

  return (
    <Container>
      <Content>
        <Title text='Password' subtext='Define your password' />
        <div className='mt-10'>
          <NewPassword onNewPassword={setPassword} setLabel={setLabel} />
        </div>
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handleProceed} label={label} disabled={!password} />
        <Button onClick={handleCancel} label='Cancel' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}

export default InitPassword