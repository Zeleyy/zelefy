use proc_macro::TokenStream;
use quote::quote;
use syn::{Data, DeriveInput, Fields, LitInt, LitStr, parse_macro_input};

#[proc_macro_derive(ApiErrorCode, attributes(api_error))]
pub fn derive_api_error_code(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    let name = &input.ident;

    let Data::Enum(data_enum) = &input.data else {
        return syn::Error::new_spanned(&input, "ApiErrorCode can only be derived for enums")
            .to_compile_error()
            .into();
    };

    let mut status_arms = Vec::new();
    let mut code_arms = Vec::new();

    for variant in &data_enum.variants {
        let variant_ident = &variant.ident;
        let mut status: Option<u16> = None;
        let mut code: Option<String> = None;

        for attr in &variant.attrs {
            if !attr.path().is_ident("api_error") {
                continue;
            }
            attr.parse_nested_meta(|meta| {
                if meta.path.is_ident("status") {
                    let lit: LitInt = meta.value()?.parse()?;
                    status = Some(lit.base10_parse()?);
                } else if meta.path.is_ident("code") {
                    let lit: LitStr = meta.value()?.parse()?;
                    code = Some(lit.value());
                }
                Ok(())
            })
            .unwrap();
        }

        let status = status.unwrap_or_else(|| {
            panic!("variant {variant_ident} missing #[api_error(status = ...)]")
        });
        let code = code.unwrap_or_else(|| {
            panic!("variant {variant_ident} missing #[api_error(code = \"...\")]")
        });

        let pattern = match &variant.fields {
            Fields::Unit => quote! { #name::#variant_ident },
            Fields::Unnamed(_) => quote! { #name::#variant_ident(..) },
            Fields::Named(_) => quote! { #name::#variant_ident { .. } },
        };

        status_arms
            .push(quote! { #pattern => ::axum::http::StatusCode::from_u16(#status).unwrap() });
        code_arms.push(quote! { #pattern => #code });
    }

    quote! {
        impl ApiErrorCode for #name {
            fn status(&self) -> ::axum::http::StatusCode {
                match self { #(#status_arms,)* }
            }
            fn code(&self) -> &'static str {
                match self { #(#code_arms,)* }
            }
        }
    }
    .into()
}
