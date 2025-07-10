// Language Switcher Component
'use client'

import { useState } from 'react'
import { useI18n, locales, localeMetadata, type Locale } from '@/lib/i18n-advanced'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Globe, Check, ChevronDown } from 'lucide-react'

// ==================== Language Switcher ====================

export function LanguageSwitcher({ variant = 'dropdown' }: { 
  variant?: 'dropdown' | 'inline' | 'modal' | 'compact' 
}) {
  const { locale, setLocale, isLoading, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const handleLocaleChange = async (newLocale: Locale) => {
    await setLocale(newLocale)
    setIsOpen(false)
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">
              {localeMetadata[locale].nativeName}
            </span>
            <span className="sm:hidden">
              {localeMetadata[locale].flag}
            </span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48">
          {locales.map((loc) => (
            <DropdownMenuItem
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{localeMetadata[loc].flag}</span>
                <span>{localeMetadata[loc].nativeName}</span>
              </div>
              {locale === loc && <Check className="w-4 h-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-gray-500" />
        <div className="flex gap-1">
          {locales.map((loc) => (
            <Button
              key={loc}
              variant={locale === loc ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleLocaleChange(loc)}
              disabled={isLoading}
              className="px-2 py-1 h-auto text-xs"
            >
              {localeMetadata[loc].flag} {localeMetadata[loc].nativeName}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center border rounded-md">
        {locales.map((loc, index) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            disabled={isLoading}
            className={`
              px-2 py-1 text-sm transition-colors
              ${locale === loc 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100'
              }
              ${index === 0 ? 'rounded-l-md' : ''}
              ${index === locales.length - 1 ? 'rounded-r-md' : ''}
              ${index !== locales.length - 1 ? 'border-r' : ''}
            `}
          >
            {localeMetadata[loc].flag}
          </button>
        ))}
      </div>
    )
  }

  // Modal variant
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t('user.language')}</h3>
      <div className="grid gap-3">
        {locales.map((loc) => (
          <Card
            key={loc}
            className={`cursor-pointer transition-all ${
              locale === loc ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={() => handleLocaleChange(loc)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{localeMetadata[loc].flag}</span>
                  <div>
                    <div className="font-medium">{localeMetadata[loc].nativeName}</div>
                    <div className="text-sm text-gray-600">{localeMetadata[loc].name}</div>
                  </div>
                </div>
                {locale === loc && (
                  <Badge variant="default">
                    {t('common.current') || 'Current'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ==================== Language Detection Banner ====================

export function LanguageDetectionBanner() {
  const { locale, setLocale, t } = useI18n()
  const [dismissed, setDismissed] = useState(false)
  const [detectedLocale, setDetectedLocale] = useState<Locale | null>(null)

  // This would run on component mount to detect user's preferred language
  useState(() => {
    const browserLang = navigator.language
    const detected = locales.find(l => browserLang.startsWith(l.split('-')[0]))
    
    if (detected && detected !== locale) {
      setDetectedLocale(detected)
    }
  })

  if (!detectedLocale || dismissed || detectedLocale === locale) {
    return null
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              {t('language.detectionMessage') || 'Language detected'}
            </p>
            <p className="text-sm text-blue-600">
              Switch to {localeMetadata[detectedLocale].nativeName}?
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setLocale(detectedLocale)}
          >
            {t('common.switch') || 'Switch'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
          >
            {t('common.dismiss') || 'Dismiss'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ==================== Language Settings Page ====================

export function LanguageSettings() {
  const { locale, setLocale, t, formatDate, formatTime, formatCurrency } = useI18n()
  const [selectedLocale, setSelectedLocale] = useState(locale)

  const handleSave = async () => {
    if (selectedLocale !== locale) {
      await setLocale(selectedLocale)
    }
  }

  const sampleDate = new Date()
  const sampleCurrency = 99.99

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('user.language')}</h2>
        <p className="text-gray-600 mt-1">
          {t('language.settingsDescription') || 'Choose your preferred language and region settings'}
        </p>
      </div>

      {/* Language Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('language.selectLanguage') || 'Select Language'}</h3>
        <div className="grid gap-3">
          {locales.map((loc) => (
            <Card
              key={loc}
              className={`cursor-pointer transition-all ${
                selectedLocale === loc ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedLocale(loc)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{localeMetadata[loc].flag}</span>
                    <div>
                      <div className="font-medium">{localeMetadata[loc].nativeName}</div>
                      <div className="text-sm text-gray-600">{localeMetadata[loc].name}</div>
                    </div>
                  </div>
                  {selectedLocale === loc && <Check className="w-5 h-5 text-blue-600" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Format Preview */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('language.formatPreview') || 'Format Preview'}</h3>
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('language.dateFormat') || 'Date Format'}:</span>
              <span>{formatDate(sampleDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('language.timeFormat') || 'Time Format'}:</span>
              <span>{formatTime(sampleDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('language.currencyFormat') || 'Currency Format'}:</span>
              <span>{formatCurrency(sampleCurrency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('language.numberFormat') || 'Number Format'}:</span>
              <span>{(12345.67).toLocaleString(selectedLocale)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      {selectedLocale !== locale && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            {t('common.save')}
          </Button>
        </div>
      )}
    </div>
  )
}

// ==================== RTL Support Component ====================

export function RTLProvider({ children }: { children: React.ReactNode }) {
  const { dir } = useI18n()

  return (
    <div dir={dir} className={dir === 'rtl' ? 'rtl' : 'ltr'}>
      {children}
    </div>
  )
}

// ==================== Locale-aware Link Component ====================

interface LocaleLinkProps {
  href: string
  locale?: Locale
  children: React.ReactNode
  className?: string
  [key: string]: any
}

export function LocaleLink({ href, locale: targetLocale, children, ...props }: LocaleLinkProps) {
  const { locale: currentLocale } = useI18n()
  const finalLocale = targetLocale || currentLocale
  
  // Add locale prefix to href
  const localizedHref = href.startsWith('/') 
    ? `/${finalLocale}${href === '/' ? '' : href}`
    : href

  return (
    <a href={localizedHref} {...props}>
      {children}
    </a>
  )
}

export default LanguageSwitcher