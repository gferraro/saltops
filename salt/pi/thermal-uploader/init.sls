thermal-uploader-pkg:
  cacophony.pkg_installed_from_github:
    - name: thermal-uploader
    - version: "1.6"

thermal-uploader-service:
  service.running:
    - name: thermal-uploader
    - enable: True
    - watch:
      - thermal-uploader-pkg

# Remove files from old thermal-uploader versions
/opt/cacophony/thermal-uploader:
  file.absent: []
