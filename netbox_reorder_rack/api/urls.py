from netbox.api.routers import NetBoxRouter

from netbox_reorder_rack.api import views

router = NetBoxRouter()

router.register("save", views.SaveViewSet, basename="reorder")

urlpatterns = router.urls
