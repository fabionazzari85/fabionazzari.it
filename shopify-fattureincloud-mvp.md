# Shopify + Fatture in Cloud MVP

Questa integrazione crea automaticamente una fattura in Fatture in Cloud quando Shopify invia il webhook `orders/paid`.

## Flusso

1. Shopify chiama `POST /api/shopify/orders-paid`
2. La funzione verifica la firma HMAC del webhook
3. Recupera l'ordine completo da Shopify Admin API
4. Controlla se esiste gia una fattura collegata all'ordine tramite metafield Shopify
5. Costruisce il payload per Fatture in Cloud
6. Crea la fattura
7. Salva su Shopify i metafield con `invoice_id` e `invoice_number`

## File principale

- `netlify/functions/shopify-fattureincloud-orders-paid.js`

## Variabili ambiente richieste

- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_ADMIN_API_TOKEN`
- `SHOPIFY_WEBHOOK_SECRET`
- `FIC_ACCESS_TOKEN`
- `FIC_COMPANY_ID`
- `FIC_DEFAULT_VAT_ID`

## Variabili ambiente opzionali

- `SHOPIFY_ADMIN_API_VERSION`
- `FIC_BASE_URL`
- `FIC_DEFAULT_COUNTRY`
- `FIC_DEFAULT_COUNTRY_ISO`
- `FIC_PAYMENT_ACCOUNT_ID`
- `FIC_PAYMENT_METHOD_ID`
- `FIC_TEMPLATE_ID`
- `FIC_CREATE_CLIENTS=true`
- `FIC_ENABLE_E_INVOICE=true`
- `FIC_EI_PAYMENT_METHOD=MP05`
- `FIC_DEFAULT_EI_CODE=0000000`
- `FIC_DOCUMENT_LANGUAGE_CODE=it`
- `FIC_DOCUMENT_LANGUAGE_NAME=Italiano`
- `SHOPIFY_FIC_METAFIELD_NAMESPACE=custom`
- `SHOPIFY_FIC_METAFIELD_KEY=fatture_in_cloud_invoice_id`
- `SHOPIFY_FIC_METAFIELD_NUMBER_KEY=fatture_in_cloud_invoice_number`
- `FIC_VAT_MAP={"22":0,"10":123,"4":456}`

## Dati fiscali letti dall'ordine Shopify

La funzione prova a leggere questi campi dai `note_attributes` dell'ordine:

- `vat_number` o `partita_iva`
- `tax_code` o `codice_fiscale`
- `ei_code`, `sdi_code` o `codice_destinatario`
- `certified_email` o `pec`
- `company_name` o `ragione_sociale`
- `address_*`, `cap`, `citta`, `provincia`

Se non li trova, usa billing address, shipping address e email presenti nell'ordine.

## Endpoint utili

- `GET /api/shopify/orders-paid`
  Restituisce lo stato configurazione della funzione.
- `POST /api/shopify/orders-paid`
  Endpoint da configurare come webhook Shopify per l'evento `orders/paid`.

## Setup Shopify

1. Crea o usa una custom app Shopify
2. Assegna almeno gli scope Admin API `read_orders` e `write_orders`
3. Imposta il webhook `orders/paid` verso:
   `https://TUO-DOMINIO/api/shopify/orders-paid`
4. Inserisci il secret del webhook in `SHOPIFY_WEBHOOK_SECRET`

## Setup Fatture in Cloud

1. Crea un'app o token API
2. Recupera `company_id`
3. Recupera il VAT ID corretto da usare come default
4. Se vuoi marcare le fatture come pagate, imposta `FIC_PAYMENT_ACCOUNT_ID`
5. Se vuoi mostrare il metodo di pagamento in fattura, imposta `FIC_PAYMENT_METHOD_ID`

## Limiti attuali del MVP

- Non gestisce ancora note di credito o rimborsi Shopify
- Per aliquote IVA miste e regole particolari conviene configurare `FIC_VAT_MAP`
- Per l'e-fattura servono dati fiscali affidabili gia presenti nell'ordine
- La deduplica e basata sul metafield salvato su Shopify

## Estensioni consigliate

- webhook per rimborsi e note di credito
- mapping IVA piu raffinato per estero/B2B/B2C
- pannello interno per rilanciare manualmente una sincronizzazione
- log persistenti delle sincronizzazioni
