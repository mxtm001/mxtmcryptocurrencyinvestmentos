"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowUpRight,
  Wallet,
  Building2,
  AlertCircle,
  Loader2,
  CheckCircle,
  Crown,
  Bitcoin,
  CreditCard,
  Smartphone,
  Shield,
  Sparkles,
  Star,
  Zap,
  Lock,
  TrendingUp,
} from "lucide-react"
import { userService } from "@/lib/user-service"

// Cryptocurrency options with icons and network details
const cryptoOptions = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    icon: "₿",
    network: "Rede Bitcoin",
    minAmount: 0.001,
    fee: "0.0005 BTC",
    addressExample: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    icon: "Ξ",
    network: "Rede Ethereum",
    minAmount: 0.01,
    fee: "0.005 ETH",
    addressExample: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
  },
  {
    id: "tether",
    name: "Tether",
    symbol: "USDT",
    icon: "₮",
    network: "ERC-20 / TRC-20",
    minAmount: 10,
    fee: "1 USDT",
    addressExample: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
  },
  {
    id: "usd-coin",
    name: "USD Coin",
    symbol: "USDC",
    icon: "🪙",
    network: "ERC-20",
    minAmount: 10,
    fee: "1 USDC",
    addressExample: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
  },
  {
    id: "binance-coin",
    name: "Binance Coin",
    symbol: "BNB",
    icon: "🟡",
    network: "Rede BSC",
    minAmount: 0.1,
    fee: "0.005 BNB",
    addressExample: "bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2",
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    icon: "🔷",
    network: "Rede Cardano",
    minAmount: 10,
    fee: "2 ADA",
    addressExample: "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj0vs2qd4a",
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    icon: "◎",
    network: "Rede Solana",
    minAmount: 0.1,
    fee: "0.01 SOL",
    addressExample: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    icon: "🟣",
    network: "Rede Polygon",
    minAmount: 1,
    fee: "0.1 MATIC",
    addressExample: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
  },
  {
    id: "litecoin",
    name: "Litecoin",
    symbol: "LTC",
    icon: "Ł",
    network: "Rede Litecoin",
    minAmount: 0.01,
    fee: "0.001 LTC",
    addressExample: "LdP8Qox1VAhCzLJNqrr74YovaWYyNBUWvL",
  },
  {
    id: "chainlink",
    name: "Chainlink",
    symbol: "LINK",
    icon: "🔗",
    network: "ERC-20",
    minAmount: 1,
    fee: "0.1 LINK",
    addressExample: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
  },
  {
    id: "polkadot",
    name: "Polkadot",
    symbol: "DOT",
    icon: "⚫",
    network: "Rede Polkadot",
    minAmount: 1,
    fee: "0.1 DOT",
    addressExample: "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5",
  },
  {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    icon: "🔺",
    network: "Rede Avalanche",
    minAmount: 0.1,
    fee: "0.01 AVAX",
    addressExample: "X-avax1x459sj0ssxzlw5n9d5qe6uscv5d5s5yqe6yx3v",
  },
]

export default function WithdrawPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("bank")
  const [selectedCrypto, setSelectedCrypto] = useState(cryptoOptions[0])
  const [walletAddress, setWalletAddress] = useState("")
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    routingNumber: "",
  })
  const [pixKey, setPixKey] = useState("")
  const [paypalEmail, setPaypalEmail] = useState("")
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState("")
  const [error, setError] = useState("")
  const [showErrorModal, setShowErrorModal] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await userService.getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }
      // Set balance to 18,000 BRL
      currentUser.balance = 18000
      setUser(currentUser)
      setLoading(false)
    }

    loadUser()
  }, [router])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const withdrawAmount = Number.parseFloat(amount)
    if (!withdrawAmount || withdrawAmount <= 0) {
      setError("Por favor, insira um valor válido")
      return
    }

    if (withdrawAmount < 100) {
      setError("O valor mínimo de saque é R$ 100")
      return
    }

    // Validate method-specific fields
    if (method === "bank") {
      if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName) {
        setError("Por favor, preencha todos os dados bancários obrigatórios")
        return
      }
    } else if (method === "crypto") {
      if (!walletAddress) {
        setError("Por favor, insira um endereço de carteira válido")
        return
      }
    } else if (method === "pix") {
      if (!pixKey) {
        setError("Por favor, insira sua chave PIX")
        return
      }
    } else if (method === "paypal") {
      if (!paypalEmail) {
        setError("Por favor, insira seu e-mail do PayPal")
        return
      }
    } else if (method === "mobile") {
      if (!mobileMoneyPhone) {
        setError("Por favor, insira seu número de telefone")
        return
      }
    }

    setProcessing(true)

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Always show the fancy error modal
      setShowErrorModal(true)
    } catch (error) {
      console.error("Withdrawal error:", error)
      setError("Ocorreu um erro inesperado")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f9a826] mx-auto mb-4"></div>
          <div className="text-gray-600">Carregando painel...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Redirecionando para login...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sacar Dinheiro</h1>
          <p className="text-gray-600 mt-1">Saque dinheiro da sua conta</p>
        </div>
        <Badge className="bg-green-100 text-green-800 px-4 py-2">
          <CheckCircle className="h-4 w-4 mr-2" />
          Conta verificada
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Withdrawal Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowUpRight className="h-5 w-5 mr-2 text-[#f9a826]" />
                Solicitação de Saque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Valor do Saque (BRL)
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0,00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 h-12 text-lg"
                      min="100"
                      step="0.01"
                      disabled={processing}
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  </div>
                  <p className="text-sm text-gray-500">Valor mínimo: R$ 100</p>
                </div>

                {/* Withdrawal Method */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Método de Saque</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setMethod("bank")}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        method === "bank" ? "border-[#f9a826] bg-[#f9a826]/5" : "border-gray-200 hover:border-gray-300"
                      }`}
                      disabled={processing}
                    >
                      <div className="flex items-center">
                        <Building2 className="h-5 w-5 mr-3 text-[#f9a826]" />
                        <div>
                          <div className="font-medium">Transferência Bancária</div>
                          <div className="text-sm text-gray-500">1-3 dias úteis</div>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMethod("pix")}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        method === "pix" ? "border-[#f9a826] bg-[#f9a826]/5" : "border-gray-200 hover:border-gray-300"
                      }`}
                      disabled={processing}
                    >
                      <div className="flex items-center">
                        <Smartphone className="h-5 w-5 mr-3 text-[#f9a826]" />
                        <div>
                          <div className="font-medium">PIX</div>
                          <div className="text-sm text-gray-500">Instantâneo</div>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMethod("crypto")}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        method === "crypto"
                          ? "border-[#f9a826] bg-[#f9a826]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      disabled={processing}
                    >
                      <div className="flex items-center">
                        <Bitcoin className="h-5 w-5 mr-3 text-[#f9a826]" />
                        <div>
                          <div className="font-medium">Criptomoeda</div>
                          <div className="text-sm text-gray-500">5-30 min</div>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMethod("paypal")}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        method === "paypal"
                          ? "border-[#f9a826] bg-[#f9a826]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      disabled={processing}
                    >
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-3 text-[#f9a826]" />
                        <div>
                          <div className="font-medium">PayPal</div>
                          <div className="text-sm text-gray-500">Instantâneo</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Bank Transfer Details */}
                {method === "bank" && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <Building2 className="h-4 w-4 mr-2" />
                      Dados Bancários
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="accountName" className="text-sm">
                          Titular da Conta
                        </Label>
                        <Input
                          id="accountName"
                          value={bankDetails.accountName}
                          onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                          placeholder="Nome completo"
                          disabled={processing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber" className="text-sm">
                          Número da Conta/IBAN
                        </Label>
                        <Input
                          id="accountNumber"
                          value={bankDetails.accountNumber}
                          onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                          placeholder="0000-0 / 00000-0"
                          disabled={processing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bankName" className="text-sm">
                          Nome do Banco
                        </Label>
                        <Input
                          id="bankName"
                          value={bankDetails.bankName}
                          onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                          placeholder="Banco do Brasil"
                          disabled={processing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="routingNumber" className="text-sm">
                          Agência (opcional)
                        </Label>
                        <Input
                          id="routingNumber"
                          value={bankDetails.routingNumber}
                          onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                          placeholder="0000"
                          disabled={processing}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PIX Details */}
                {method === "pix" && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <Smartphone className="h-4 w-4 mr-2" />
                      Dados do PIX
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="pixKey" className="text-sm">
                        Chave PIX
                      </Label>
                      <Input
                        id="pixKey"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        placeholder="CPF, e-mail, telefone ou chave aleatória"
                        disabled={processing}
                      />
                      <p className="text-xs text-gray-500">
                        Informe sua chave PIX (CPF, CNPJ, e-mail, telefone ou chave aleatória)
                      </p>
                    </div>
                  </div>
                )}

                {/* Crypto Selection */}
                {method === "crypto" && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <Bitcoin className="h-4 w-4 mr-2" />
                      Selecionar Criptomoeda
                    </h3>

                    <div className="space-y-3">
                      <Label className="text-sm">Criptomoeda</Label>
                      <Select
                        value={selectedCrypto.id}
                        onValueChange={(value) => {
                          const crypto = cryptoOptions.find((c) => c.id === value)
                          if (crypto) setSelectedCrypto(crypto)
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecionar criptomoeda" />
                        </SelectTrigger>
                        <SelectContent>
                          {cryptoOptions.map((crypto) => (
                            <SelectItem key={crypto.id} value={crypto.id}>
                              <div className="flex items-center">
                                <span className="text-lg mr-2">{crypto.icon}</span>
                                <div>
                                  <div className="font-medium">{crypto.name}</div>
                                  <div className="text-xs text-gray-500">{crypto.network}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center text-sm text-blue-800 mb-2">
                        <Shield className="h-4 w-4 mr-2" />
                        <span className="font-medium">Criptomoeda Selecionada</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-600">Rede:</span>
                          <div className="font-medium">{selectedCrypto.network}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Taxa:</span>
                          <div className="font-medium">{selectedCrypto.fee}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Valor mínimo:</span>
                          <div className="font-medium">
                            {selectedCrypto.minAmount} {selectedCrypto.symbol}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Tempo de processamento:</span>
                          <div className="font-medium">5-30 Min</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="walletAddress" className="text-sm">
                        Endereço da Carteira {selectedCrypto.name}
                      </Label>
                      <Textarea
                        id="walletAddress"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder={`Insira seu endereço de carteira ${selectedCrypto.name}\nExemplo: ${selectedCrypto.addressExample}`}
                        className="min-h-[80px] font-mono text-sm"
                        disabled={processing}
                      />
                      <div className="flex items-center text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>
                          Certifique-se de que o endereço da carteira está correto. Endereços incorretos podem levar a
                          perda permanente.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* PayPal Details */}
                {method === "paypal" && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Dados do PayPal
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="paypalEmail" className="text-sm">
                        E-mail do PayPal
                      </Label>
                      <Input
                        id="paypalEmail"
                        type="email"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="seu.email@exemplo.com"
                        disabled={processing}
                      />
                    </div>
                  </div>
                )}

                {/* Security Notice */}
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Aviso de Segurança:</strong> Todos os saques requerem um saldo mínimo de R$ 2.000 para
                    processamento. Isso garante a segurança e verificação da sua conta.
                  </AlertDescription>
                </Alert>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#f9a826] to-yellow-500 hover:from-[#f9a826]/90 hover:to-yellow-500/90 text-black font-semibold h-12"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando saque...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Solicitar Saque
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Wallet className="h-5 w-5 mr-2 text-[#f9a826]" />
                Saldo da Conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(18000)}</div>
              <div className="text-sm text-gray-500">Disponível para saque</div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Conta totalmente verificada</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal Methods Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Métodos Disponíveis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Transferência</span>
                </div>
                <span className="text-sm font-medium text-green-600">Disponível</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Smartphone className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">PIX</span>
                </div>
                <span className="text-sm font-medium text-green-600">Instantâneo</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bitcoin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Criptomoeda</span>
                </div>
                <span className="text-sm font-medium text-green-600">12 Opções</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">PayPal</span>
                </div>
                <span className="text-sm font-medium text-green-600">Disponível</span>
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Limites de Saque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Diário</span>
                <span className="text-sm font-medium">R$ 50.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Semanal</span>
                <span className="text-sm font-medium">R$ 200.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Mensal</span>
                <span className="text-sm font-medium">R$ 500.000</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Valor mínimo</span>
                  <span className="text-sm font-medium">R$ 100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Times */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tempos de Processamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Transferência</span>
                </div>
                <span className="text-sm font-medium">1-3 dias úteis</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Smartphone className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">PIX</span>
                </div>
                <span className="text-sm font-medium">Instantâneo</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bitcoin className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Criptomoeda</span>
                </div>
                <span className="text-sm font-medium">5-30 Min</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">PayPal</span>
                </div>
                <span className="text-sm font-medium">Instantâneo</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ultra Fancy Premium Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-2xl border-0 p-0 overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating orbs */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-r from-pink-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-20 w-36 h-36 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
            <div className="absolute bottom-10 right-10 w-28 h-28 bg-gradient-to-r from-green-400/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>

            {/* Sparkle effects */}
            <div className="absolute top-1/4 left-1/4 animate-ping">
              <Star className="h-4 w-4 text-yellow-300/50" />
            </div>
            <div className="absolute top-1/3 right-1/3 animate-ping delay-700">
              <Sparkles className="h-5 w-5 text-purple-300/50" />
            </div>
            <div className="absolute bottom-1/4 right-1/4 animate-ping delay-1000">
              <Star className="h-3 w-3 text-blue-300/50" />
            </div>
          </div>

          <div className="relative z-10 p-8">
            <DialogHeader>
              <DialogTitle className="text-center space-y-6">
                {/* Premium Crown Icon with Glow */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform">
                      <Crown className="h-12 w-12 text-white animate-bounce" />
                    </div>
                  </div>
                </div>

                {/* Premium Title with Gradient */}
                <div className="space-y-2">
                  <h2 className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent animate-pulse">
                    🌟 ATIVAÇÃO PREMIUM VIP 🌟
                  </h2>
                  <div className="flex justify-center space-x-2">
                    <Sparkles className="h-6 w-6 text-yellow-400 animate-spin" />
                    <Crown className="h-6 w-6 text-orange-400 animate-bounce" />
                    <Star className="h-6 w-6 text-pink-400 animate-pulse" />
                    <Zap className="h-6 w-6 text-blue-400 animate-ping" />
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-8">
              {/* Status Alert */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-red-400/50 bg-gradient-to-r from-red-900/80 to-pink-900/80 p-6 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 animate-pulse"></div>
                <div className="relative space-y-3">
                  <div className="flex items-center justify-center space-x-3">
                    <Lock className="h-8 w-8 text-red-300 animate-bounce" />
                    <h3 className="text-2xl font-bold text-white">SAQUE BLOQUEADO</h3>
                    <Lock className="h-8 w-8 text-red-300 animate-bounce" />
                  </div>
                  <p className="text-center text-red-200 text-lg font-semibold">
                    🚨 Ativação de Conta Premium Necessária 🚨
                  </p>
                </div>
              </div>

              {/* Premium Package */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-900/80 via-orange-900/80 to-red-900/80 p-8 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 animate-pulse"></div>
                <div className="relative space-y-4">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <Crown className="h-10 w-10 text-yellow-300 animate-bounce" />
                    <h3 className="text-3xl font-black text-yellow-200">PACOTE EXCLUSIVO</h3>
                    <Crown className="h-10 w-10 text-yellow-300 animate-bounce" />
                  </div>

                  {/* Price Display */}
                  <div className="text-center space-y-2 bg-black/30 rounded-xl p-6 border-2 border-yellow-400/30">
                    <div className="text-yellow-400 text-sm font-semibold tracking-wider">INVESTIMENTO ÚNICO</div>
                    <div className="text-6xl font-black bg-gradient-to-r from-yellow-200 via-orange-200 to-yellow-200 bg-clip-text text-transparent">
                      R$ 2.000
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-green-300 text-lg font-bold">
                      <TrendingUp className="h-5 w-5" />
                      <span>LIBERA R$ 18.000</span>
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Benefits Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-gradient-to-br from-blue-600/40 to-cyan-600/40 rounded-xl p-4 border border-blue-400/30 transform hover:scale-105 transition-transform">
                      <Zap className="h-8 w-8 text-blue-300 mx-auto mb-2 animate-pulse" />
                      <div className="text-blue-200 font-bold text-sm text-center">ATIVAÇÃO</div>
                      <div className="text-blue-100 text-xs text-center">Instantânea</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-600/40 to-emerald-600/40 rounded-xl p-4 border border-green-400/30 transform hover:scale-105 transition-transform">
                      <Shield className="h-8 w-8 text-green-300 mx-auto mb-2 animate-pulse" />
                      <div className="text-green-200 font-bold text-sm text-center">SEGURANÇA</div>
                      <div className="text-green-100 text-xs text-center">Máxima</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600/40 to-pink-600/40 rounded-xl p-4 border border-purple-400/30 transform hover:scale-105 transition-transform">
                      <Star className="h-8 w-8 text-purple-300 mx-auto mb-2 animate-spin" />
                      <div className="text-purple-200 font-bold text-sm text-center">STATUS</div>
                      <div className="text-purple-100 text-xs text-center">VIP Premium</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-600/40 to-red-600/40 rounded-xl p-4 border border-orange-400/30 transform hover:scale-105 transition-transform">
                      <CheckCircle className="h-8 w-8 text-orange-300 mx-auto mb-2 animate-bounce" />
                      <div className="text-orange-200 font-bold text-sm text-center">SAQUES</div>
                      <div className="text-orange-100 text-xs text-center">Ilimitados</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exclusive Features */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-purple-400/50 bg-gradient-to-br from-purple-900/80 to-indigo-900/80 p-6 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 animate-pulse"></div>
                <div className="relative">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Sparkles className="h-5 w-5 text-purple-300" />
                    <h4 className="text-xl font-bold text-purple-200">BENEFÍCIOS EXCLUSIVOS</h4>
                    <Sparkles className="h-5 w-5 text-purple-300" />
                  </div>
                  <div className="space-y-2 text-purple-100 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>✨ Acesso VIP a todos os métodos de saque</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>⚡ Processamento prioritário instantâneo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>🔒 Proteção máxima e criptografia avançada</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>👑 Status Premium vitalício</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>💎 Suporte dedicado 24/7</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-4">
                <Button
                  onClick={() => setShowErrorModal(false)}
                  className="relative overflow-hidden bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-black text-lg px-10 py-6 rounded-xl shadow-2xl transform hover:scale-110 transition-all border-2 border-yellow-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/50 to-orange-400/50 animate-pulse"></div>
                  <div className="relative flex items-center space-x-3">
                    <Crown className="h-6 w-6 animate-bounce" />
                    <span>ATIVAR PREMIUM AGORA</span>
                    <Sparkles className="h-6 w-6 animate-spin" />
                  </div>
                </Button>
              </div>

              {/* Urgency Message */}
              <div className="text-center">
                <p className="text-yellow-300 text-sm font-semibold animate-pulse">
                  ⚡ OFERTA EXCLUSIVA • ATIVE AGORA E LIBERE SEUS R$ 18.000 ⚡
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
