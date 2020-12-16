import Component from "./component.svelte";

const app = new Component({
    target : document.querySelector(".root")
});

export default app;

if (import.meta.hot) {
    import.meta.hot.accept();
    import.meta.hot.dispose(() => {
        app.$destroy();
    });
}