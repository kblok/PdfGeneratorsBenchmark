For ($i=1; $i -le 10; $i++) {
   Write-Host ("iteration ", $i)
   .\wkhtmltopdf.exe "file:///C:/source/personal/PdfGeneratorsBenchmark/Site/Site.htm" "output.pdf"
}