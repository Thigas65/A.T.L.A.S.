package com.atlas.companion

import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(28, 36, 28, 28)
        }
        val title = TextView(this).apply { text = "ATLAS Companion"; textSize = 26f }
        val explanation = TextView(this).apply {
            text = "Etapa inicial: abrir o Instagram e preparar um texto para você revisar. O app não lê sua senha nem envia mensagens sozinho."
            textSize = 16f
            setPadding(0, 16, 0, 20)
        }
        val draft = EditText(this).apply {
            hint = "Digite ou cole a mensagem que deseja preparar"
            minLines = 3
            gravity = Gravity.TOP
        }
        val openButton = Button(this).apply {
            text = "Abrir Instagram"
            setOnClickListener { openInstagram() }
        }
        val copyButton = Button(this).apply {
            text = "Copiar mensagem"
            setOnClickListener {
                val value = draft.text.toString().trim()
                if (value.isEmpty()) {
                    Toast.makeText(this@MainActivity, "Digite uma mensagem primeiro.", Toast.LENGTH_SHORT).show()
                } else {
                    val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                    clipboard.setPrimaryClip(ClipData.newPlainText("Mensagem do ATLAS", value))
                    Toast.makeText(this@MainActivity, "Mensagem copiada. Revise antes de enviar.", Toast.LENGTH_LONG).show()
                }
            }
        }
        layout.addView(title)
        layout.addView(explanation)
        layout.addView(draft, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
        layout.addView(openButton)
        layout.addView(copyButton)
        setContentView(layout)
    }

    private fun openInstagram() {
        val packageIntent = packageManager.getLaunchIntentForPackage("com.instagram.android")
        if (packageIntent != null) startActivity(packageIntent)
        else startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.instagram.com/")))
    }
}
