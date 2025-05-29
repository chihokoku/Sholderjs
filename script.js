window.addEventListener("DOMContentLoaded", init);

function init() {
  const canvas = document.getElementById("canvas1");

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  const width = 800;
  const height = 500;
  renderer.setSize(width, height);

  // カメラの設定
  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 500;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 100;

  // シーンの設定
  const scene = new THREE.Scene();

  // カメラコントロールができるようにする(オービットコントロールを作成)
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true; // 慣性の有効化
  controls.dampingFactor = 0.25;

  // ファイル入力要素の取得
  const fileInput = document.getElementById("fileInput");

  // ファイルが選択されたときの処理
  fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      const fileName = file.name.toLowerCase();
      reader.onload = function (e) {
        const contents = e.target.result;
        let object = 0;
        if (fileName.endsWith(".obj")) {
          // OBJLoaderで読み込み
          const objLoader = new THREE.OBJLoader();
          object = objLoader.parse(contents);
        } else if (fileName.endsWith(".stl")) {
          console.log(fileName);
          const stlLoader = new THREE.STLLoader();
          const geometry = stlLoader.parse(contents);
          const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
          object = new THREE.Mesh(geometry, material);
        } else {
          console.log("ファイルが選択されていません");
        }
        object.position.set(0, 0, 0);
        scene.add(object);
      };
      if (fileName.endsWith(".obj")) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
  });

  // 環境光源を作成
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // 平行光源を作成
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.intensity = 1;
  directionalLight.position.set(1, 10, 1);
  scene.add(directionalLight);

  // 座標軸の表示
  // new THREE.AxesHelper(軸の長さ);
  const axis = new THREE.AxesHelper(100);
  scene.add(axis);

  // 画面をレンダリング(アニメーション)
  tick();

  function tick() {
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(tick);
  }
}
