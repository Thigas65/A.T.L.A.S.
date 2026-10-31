package com.atlas.companion

import android.app.Activity
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import android.graphics.Color
import android.graphics.Typeface
import android.view.Gravity
import android.view.inputmethod.InputMethodManager
import android.content.Context
import android.content.Intent
import android.net.Uri

class MainActivity : Activity() {
    private lateinit var root: LinearLayout
    private lateinit var webView: WebView
    private lateinit var addressInput: EditText
    private lateinit var progress: ProgressBar
    private lateinit var status: TextView

    private val preferences by lazy { getSharedPreferences("atlas_app", MODE_PRIVATE) }
    private val defaultAtlasUrl = "https://a-t-l-a-s-1.onrender.com"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.rgb(5, 12, 27)
        window.navigationBarColor = Color.rgb(5, 12, 27)
        if (preferences.getString("atlas_url", null).isNullOrBlank()) {
            preferences.edit().putString("atlas_url", defaultAtlasUrl).apply()
        }
        showApp()
        loadAtlas(preferences.getString("atlas_url", defaultAtlasUrl) ?: defaultAtlasUrl)
    }

    private fun showApp() {
        root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.rgb(5, 12, 27))
        }

        val header = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(20, 12, 16, 12)
            setBackgroundColor(Color.rgb(8, 20, 42))
        }
        val title = TextView(this).apply {
            text = "ATLAS"
            textSize = 21f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(Color.rgb(91, 204, 255))
        }
        val changeButton = Button(this).apply {
            text = "Endereço"
            setOnClickListener { showAddressSetup() }
        }
        header.addView(title, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        header.addView(changeButton)

        progress = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            visibility = View.GONE
            isIndeterminate = true
        }
        status = TextView(this).apply {
            text = "Conecte o aplicativo ao seu ATLAS."
            textSize = 14f
            setTextColor(Color.LTGRAY)
            gravity = Gravity.CENTER
            setPadding(24, 12, 24, 12)
        }

        webView = WebView(this).apply {
            setBackgroundColor(Color.rgb(5, 12, 27))
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.loadsImagesAutomatically = true
            settings.mediaPlaybackRequiresUserGesture = false
            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                    progress.visibility = View.VISIBLE
                    status.visibility = View.GONE
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    progress.visibility = View.GONE
                }

                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                    val uri = request.url
                    if (uri.scheme == "https" && uri.host != null) return false
                    if (uri.scheme == "tel" || uri.scheme == "mailto") {
                        startActivity(Intent(Intent.ACTION_VIEW, uri))
                        return true
                    }
                    return true
                }
            }
            webChromeClient = WebChromeClient()
        }

        root.addView(header)
        root.addView(progress, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 4))
        root.addView(status)
        root.addView(webView, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f))
        setContentView(root)

    }

    private fun showAddressSetup() {
        status.visibility = View.VISIBLE
        webView.visibility = View.GONE
        addressInput = EditText(this).apply {
            hint = "https://seu-atlas.onrender.com"
            setSingleLine(true)
            setText(preferences.getString("atlas_url", ""))
            setTextColor(Color.WHITE)
            setHintTextColor(Color.GRAY)
            setPadding(20, 14, 20, 14)
        }
        val help = TextView(this).apply {
            text = "Informe o endereço público do ATLAS hospedado no Render. Esse endereço fica salvo somente neste aparelho."
            textSize = 14f
            setTextColor(Color.LTGRAY)
            setPadding(24, 4, 24, 16)
        }
        val connect = Button(this).apply {
            text = "Conectar ao ATLAS"
            setOnClickListener {
                val value = addressInput.text.toString().trim().trimEnd('/')
                val uri = runCatching { Uri.parse(value) }.getOrNull()
                if (uri == null || uri.scheme != "https" || uri.host.isNullOrBlank()) {
                    Toast.makeText(this@MainActivity, "Use um endereço válido começando com https://", Toast.LENGTH_LONG).show()
                } else {
                    preferences.edit().putString("atlas_url", value).apply()
                    (getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager)
                        .hideSoftInputFromWindow(addressInput.windowToken, 0)
                    loadAtlas(value)
                }
            }
        }
        val panel = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(20, 20, 20, 20)
            addView(help)
            addView(addressInput, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
            addView(connect)
        }
        val old = root.findViewWithTag<View>("address_setup")
        if (old != null) root.removeView(old)
        panel.tag = "address_setup"
        root.addView(panel, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
    }

    private fun loadAtlas(url: String) {
        root.findViewWithTag<View>("address_setup")?.let { root.removeView(it) }
        status.visibility = View.GONE
        webView.visibility = View.VISIBLE
        webView.loadUrl(url)
    }

    @Deprecated("Deprecated in Android API 33; retained for compatibility")
    override fun onBackPressed() {
        if (::webView.isInitialized && webView.canGoBack()) webView.goBack()
        else super.onBackPressed()
    }

    override fun onDestroy() {
        if (::webView.isInitialized) webView.destroy()
        super.onDestroy()
    }
}
